using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using DreamMF.RemoteOrchestration.Database;
using Microsoft.EntityFrameworkCore;
using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.Data.Sqlite;
using System.Text;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class SearchService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;

    public SearchService(IRemoteOrchestrationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Models.SearchResponse> SearchAsync(string searchText, List<string>? tagValues = null)
    {
        if (string.IsNullOrWhiteSpace(searchText) && (tagValues == null || !tagValues.Any()))
        {
            throw new HandledException(ExceptionType.Validation, "Either search text or tag values must be provided");
        }

        // Parse field-specific search terms (e.g., "name:dashboard", "description:dream")
        var fieldSpecificSearches = new Dictionary<string, string>();
        var generalSearchText = searchText;
        var isTagSearch = false;
        var isModuleSearch = false;
        var tagSearchValue = string.Empty;
        var moduleSearchValue = string.Empty;
        
        if (!string.IsNullOrWhiteSpace(searchText) && searchText.Contains(':'))
        {
            var parts = searchText.Split(':', 2);
            var fieldName = parts[0].Trim().ToLowerInvariant();
            var fieldValue = parts[1].Trim();
            
            // Check for tag or module search first
            if (fieldName.Equals("tag", StringComparison.OrdinalIgnoreCase))
            {
                isTagSearch = true;
                tagSearchValue = fieldValue;
                generalSearchText = null; // Use tag search instead of general search
            }
            else if (fieldName.Equals("module", StringComparison.OrdinalIgnoreCase))
            {
                isModuleSearch = true;
                moduleSearchValue = fieldValue;
                generalSearchText = null; // Use module search instead of general search
            }
            else
            {
                // Map common field names to database column names
                var fieldMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    { "name", "EntityName" },
                    { "description", "Description" },
                    { "scope", "Scope" },
                    { "key", "EntityKey" },
                    { "environment", "Environment" }
                };
                
                if (fieldMap.ContainsKey(fieldName))
                {
                    // Only add the field-specific search if the value is not empty
                    if (!string.IsNullOrWhiteSpace(fieldValue))
                    {
                        fieldSpecificSearches.Add(fieldMap[fieldName], fieldValue);
                    }
                    generalSearchText = null; // Use field-specific search instead of general search
                }
            }
        }
        
        var searchLower = generalSearchText?.ToLowerInvariant() ?? string.Empty;
        
        // Build SQL query with parameters
        var sqlBuilder = new StringBuilder();
        sqlBuilder.Append("SELECT * FROM v_SearchResults WHERE 1=1 ");
        
        var parameters = new List<SqliteParameter>();
        
        // Check if we have a field-specific search with an empty value
        bool hasEmptyFieldSearch = (searchText?.Contains(':') == true) && 
                                  !fieldSpecificSearches.Any() && 
                                  generalSearchText == null && 
                                  !isTagSearch && 
                                  !isModuleSearch;

        // Add field-specific search conditions if provided
        if (fieldSpecificSearches.Any())
        {
            sqlBuilder.Append(" AND (");
            var conditions = new List<string>();
            
            int paramIndex = 0;
            foreach (var field in fieldSpecificSearches)
            {
                var paramName = $"@field{paramIndex}";
                conditions.Add($"LOWER({field.Key}) LIKE {paramName}");
                parameters.Add(new SqliteParameter(paramName, $"%{field.Value.ToLowerInvariant()}%"));
                paramIndex++;
            }
            
            sqlBuilder.Append(string.Join(" OR ", conditions));
            sqlBuilder.Append(")");
        }
        // Add general search text condition if provided
        else if (!string.IsNullOrWhiteSpace(generalSearchText))
        {
            sqlBuilder.Append(@"
                AND (LOWER(EntityName) LIKE @searchText 
                    OR LOWER(Description) LIKE @searchText 
                    OR LOWER(Scope) LIKE @searchText 
                    OR LOWER(EntityKey) LIKE @searchText)");
            parameters.Add(new SqliteParameter("@searchText", $"%{searchLower}%"));
        }
        // If we have a field-specific search with an empty value, add a condition that will return no results
        else if (hasEmptyFieldSearch)
        {
            sqlBuilder.Append(" AND 1=0"); // This will ensure no results are returned
        }
        // Tag and module searches will be handled after the initial query
        
        // Get all search results using the view
        var searchResults = await _dbContext.Set<SearchResult>()
            .FromSqlRaw(sqlBuilder.ToString(), parameters.ToArray())
            .ToListAsync();

        // Group results by type and fetch full entities
        var hostIds = searchResults
            .Where(r => r.EntityType == "Host")
            .Select(r => r.EntityId)
            .ToList();

        var remoteIds = searchResults
            .Where(r => r.EntityType == "Remote")
            .Select(r => r.EntityId)
            .ToList();

        // Fetch complete host entities with tags
        var hosts = await _dbContext.Hosts
            .Include(h => h.Tags_Hosts)
                .ThenInclude(th => th.Tag)
            .Where(h => hostIds.Contains(h.Host_ID))
            .ToListAsync();

        // Fetch complete remote entities with modules and tags
        var remotes = await _dbContext.Remotes
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .Include(r => r.Tags_Remotes)
                .ThenInclude(tr => tr.Tag)
            .Where(r => remoteIds.Contains(r.Remote_ID))
            .ToListAsync();
            
        // Handle tag search from search text
        if (isTagSearch)
        {
            if (!string.IsNullOrWhiteSpace(tagSearchValue))
            {
                // Filter hosts by tag value
                hosts = hosts.Where(h => 
                    h.Tags_Hosts != null && h.Tags_Hosts.Any(th => 
                        (th.Value != null && th.Value.ToLowerInvariant().Contains(tagSearchValue.ToLowerInvariant())) ||
                        (th.Tag != null && th.Tag.Key != null && th.Tag.Key.ToLowerInvariant().Contains(tagSearchValue.ToLowerInvariant()))
                    )
                ).ToList();
                
                // Filter remotes by tag value
                remotes = remotes.Where(r => 
                    r.Tags_Remotes != null && r.Tags_Remotes.Any(tr => 
                        (tr.Value != null && tr.Value.ToLowerInvariant().Contains(tagSearchValue.ToLowerInvariant())) ||
                        (tr.Tag != null && tr.Tag.Key != null && tr.Tag.Key.ToLowerInvariant().Contains(tagSearchValue.ToLowerInvariant()))
                    )
                ).ToList();
            }
            else
            {
                // If tag: is provided without a value, return no results
                hosts = new List<Database.Entities.Host>();
                remotes = new List<Database.Entities.Remote>();
            }
        }
        
        // Handle module search from search text
        if (isModuleSearch)
        {
            // For module search, we should never return hosts since they don't have modules
            hosts = new List<Database.Entities.Host>();
            
            // Only filter remotes if a module search value is provided
            if (!string.IsNullOrWhiteSpace(moduleSearchValue))
            {
                // Filter remotes by module name
                remotes = remotes.Where(r => 
                    r.RemoteModules != null && r.RemoteModules.Any(rm => 
                        rm.Module != null && rm.Module.Name.ToLowerInvariant().Contains(moduleSearchValue.ToLowerInvariant())
                    )
                ).ToList();
            }
            else
            {
                // If module: is provided without a value, return no results
                remotes = new List<Database.Entities.Remote>();
            }
        }
        
        // Filter by tag values if provided (for backward compatibility)
        if (tagValues != null && tagValues.Any())
        {   
            // Convert tag values to lowercase for case-insensitive comparison
            var tagValuesLower = tagValues.Select(tv => tv.ToLowerInvariant()).ToList();
            
            // Check if any tag values contain key:value format for specific tag searches
            var specificTagSearches = tagValuesLower
                .Where(tv => tv.Contains(':'))
                .Select(tv => {
                    var parts = tv.Split(':', 2);
                    return new { Key = parts[0].Trim(), Value = parts[1].Trim() };
                })
                .ToList();
                
            var generalTagValues = tagValuesLower
                .Where(tv => !tv.Contains(':'))
                .ToList();
            
            // Filter hosts by tag values
            hosts = hosts.Where(h => 
                h.Tags_Hosts != null && (
                    // Match general tag values
                    (generalTagValues.Any() && h.Tags_Hosts.Any(th => 
                        th.Value != null && 
                        generalTagValues.Any(tv => th.Value.ToLowerInvariant().Contains(tv))
                    )) ||
                    // Match specific tag key:value pairs
                    (specificTagSearches.Any() && specificTagSearches.All(sts => 
                        h.Tags_Hosts.Any(th => 
                            th.Tag != null && th.Value != null &&
                            th.Tag.Key.ToLowerInvariant().Contains(sts.Key) && 
                            th.Value.ToLowerInvariant().Contains(sts.Value)
                        )
                    )) ||
                    // If no tag values are provided, don't filter
                    (!generalTagValues.Any() && !specificTagSearches.Any())
                )
            ).ToList();
            
            // Filter remotes by tag values
            remotes = remotes.Where(r => 
                r.Tags_Remotes != null && (
                    // Match general tag values
                    (generalTagValues.Any() && r.Tags_Remotes.Any(tr => 
                        tr.Value != null && 
                        generalTagValues.Any(tv => tr.Value.ToLowerInvariant().Contains(tv))
                    )) ||
                    // Match specific tag key:value pairs
                    (specificTagSearches.Any() && specificTagSearches.All(sts => 
                        r.Tags_Remotes.Any(tr => 
                            tr.Tag != null && tr.Value != null &&
                            tr.Tag.Key.ToLowerInvariant().Contains(sts.Key) && 
                            tr.Value.ToLowerInvariant().Contains(sts.Value)
                        )
                    )) ||
                    // If no tag values are provided, don't filter
                    (!generalTagValues.Any() && !specificTagSearches.Any())
                )
            ).ToList();
            
            // Special case: Check for Module tag searches
            if (specificTagSearches.Any(s => s.Key.Equals("module", StringComparison.OrdinalIgnoreCase)))
            {
                var moduleSearches = specificTagSearches
                    .Where(s => s.Key.Equals("module", StringComparison.OrdinalIgnoreCase))
                    .Select(s => s.Value)
                    .ToList();
                
                // Filter remotes by module name
                remotes = remotes.Where(r => 
                    r.RemoteModules != null && 
                    r.RemoteModules.Any(rm => 
                        rm.Module != null && 
                        moduleSearches.Any(ms => 
                            rm.Module.Name.ToLowerInvariant().Contains(ms.ToLowerInvariant())
                        )
                    )
                ).ToList();
            }
        }

        return new Models.SearchResponse
        {
            Hosts = hosts.Select(HostMapper.ToResponse).ToList(),
            Remotes = remotes.Select(RemoteMapper.ToResponse).ToList()
        };
    }
}
