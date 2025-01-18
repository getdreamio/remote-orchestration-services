using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using DreamMF.RemoteOrchestration.Database;
using Microsoft.EntityFrameworkCore;
using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.Data.Sqlite;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class SearchService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;

    public SearchService(IRemoteOrchestrationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Models.SearchResponse> SearchAsync(string searchText)
    {
        if (string.IsNullOrWhiteSpace(searchText))
        {
            throw new HandledException(ExceptionType.Validation, "Search text cannot be empty");
        }

        var searchLower = searchText.ToLowerInvariant();

        // Get all search results using the view
        var searchResults = await _dbContext.Set<SearchResult>()
            .FromSqlRaw(@"
                SELECT * FROM v_SearchResults 
                WHERE LOWER(EntityName) LIKE @searchText 
                    OR LOWER(Description) LIKE @searchText 
                    OR LOWER(Scope) LIKE @searchText 
                    OR LOWER(EntityKey) LIKE @searchText",
                new SqliteParameter("@searchText", $"%{searchLower}%"))
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

        // Fetch complete host entities
        var hosts = await _dbContext.Hosts
            .Where(h => hostIds.Contains(h.Host_ID))
            .ToListAsync();

        // Fetch complete remote entities with modules
        var remotes = await _dbContext.Remotes
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .Where(r => remoteIds.Contains(r.Remote_ID))
            .ToListAsync();

        return new Models.SearchResponse
        {
            Hosts = hosts.Select(HostMapper.ToResponse).ToList(),
            Remotes = remotes.Select(RemoteMapper.ToResponse).ToList()
        };
    }
}
