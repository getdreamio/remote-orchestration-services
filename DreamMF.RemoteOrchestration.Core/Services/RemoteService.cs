using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class RemoteService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;
    private readonly IAnalyticsService _analyticsService;

    public RemoteService(IRemoteOrchestrationDbContext dbContext, IAnalyticsService analyticsService)
    {
        _dbContext = dbContext;
        _analyticsService = analyticsService;
    }

    public async Task<List<RemoteResponse>> GetAllRemotesAsync()
    {
        var remotes = await _dbContext.Remotes
            .Include(r => r.Host_Remotes)
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .ToListAsync();

        var remoteResponses = remotes.Select(RemoteMapper.ToResponse).ToList();
        return remoteResponses;
    }

    public async Task<List<ModuleResponse>> GetAllRemoteModulesAsync(int? maxResults = null, string? contains = null)
    {
        var query = _dbContext.Modules.AsQueryable();

        if (!string.IsNullOrWhiteSpace(contains))
        {
            query = query.Where(m => EF.Functions.Like(m.Name.ToLower(), $"%{contains.ToLower()}%"));
        }

        if (maxResults.HasValue)
        {
            query = query.Take(maxResults.Value);
        }

        var modules = await query.ToListAsync();
        return modules.Select(ModuleMapper.ToResponse).ToList();
    }   

    public async Task<RemoteResponse?> GetRemoteByIdAsync(int id)
    {
        var remote = await _dbContext.Remotes
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .FirstOrDefaultAsync(r => r.Remote_ID == id);

        if (remote != null)
        {
            _ = _analyticsService.LogRemoteReadAsync(remote.Remote_ID, "Read", 1);
        }
        return remote != null ? RemoteMapper.ToResponse(remote) : null;
    }

    public async Task<RemoteResponse?> CreateRemoteAsync(RemoteRequest request)
    {
        var remote = RemoteMapper.ToEntity(request);
        
        // Save the remote first to get its ID
        _dbContext.Remotes.Add(remote);
        await _dbContext.SaveChangesAsync();

        // Now handle the modules
        foreach (var module in request.Modules)
        {
            Module moduleEntity;
            if (module.Id == 0)
            {
                // Create new module
                moduleEntity = new Module
                {
                    Name = module.Name,
                    Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                };
                _dbContext.Modules.Add(moduleEntity);
                await _dbContext.SaveChangesAsync();
            }
            else
            {
                // Use existing module
                moduleEntity = await _dbContext.Modules.FindAsync(module.Id);
                if (moduleEntity == null) continue;
            }

            // Create the linking object
            var remoteModule = new RemoteModule
            {
                Remote_ID = remote.Remote_ID,
                Module_ID = moduleEntity.Module_ID,
                Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
            
            _dbContext.RemoteModules.Add(remoteModule);
        }

        await _dbContext.SaveChangesAsync();
        _ = _analyticsService.LogRemoteReadAsync(remote.Remote_ID, "Create", 1);

        return await GetRemoteByIdAsync(remote.Remote_ID);
    }

    public async Task<RemoteResponse> UpdateRemoteAsync(int id, RemoteRequest request)
    {
        var remote = await _dbContext.Remotes
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .FirstOrDefaultAsync(r => r.Remote_ID == id);

        if (remote == null) return null;

        // Update basic properties
        remote.Name = request.Name;
        remote.Key = request.Key;
        remote.Scope = request.Scope;
        remote.Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        remote.Repository = request.Repository;
        remote.Contact_Name = request.ContactName;
        remote.Contact_Email = request.ContactEmail;
        remote.Documentation_Url = request.DocumentationUrl;

        // Get module names for comparison
        var currentModules = remote.RemoteModules
            .Select(rm => new { rm.Module.Name, RemoteModule = rm })
            .ToDictionary(x => x.Name, x => x.RemoteModule);

        var requestedModuleNames = request.Modules
            .Select(m => m.Name)
            .ToHashSet();

        // Remove modules that are no longer requested
        var modulesToRemove = currentModules
            .Where(kvp => !requestedModuleNames.Contains(kvp.Key))
            .Select(kvp => kvp.Value)
            .ToList();

        foreach (var moduleToRemove in modulesToRemove)
        {
            remote.RemoteModules.Remove(moduleToRemove);
        }

        // Add new modules
        var modulesToAdd = requestedModuleNames
            .Where(name => !currentModules.ContainsKey(name))
            .ToList();

        if (modulesToAdd.Any())
        {
            // Get existing modules from DB to avoid duplicates
            var existingModules = await _dbContext.Modules
                .Where(m => modulesToAdd.Contains(m.Name))
                .ToDictionaryAsync(m => m.Name, m => m);

            foreach (var moduleName in modulesToAdd)
            {
                Module module;
                if (!existingModules.TryGetValue(moduleName, out module))
                {
                    module = new Module
                    {
                        Name = moduleName,
                        Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                        Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                    };
                    _dbContext.Modules.Add(module);
                }

                remote.RemoteModules.Add(new RemoteModule
                {
                    Module = module,
                    Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                });
            }
        }

        await _dbContext.SaveChangesAsync();
        _ = _analyticsService.LogRemoteReadAsync(id, "Update", 1);
        
        return RemoteMapper.ToResponse(remote);
    }

    public async Task<bool> DeleteRemoteAsync(int id)
    {
        var remote = await _dbContext.Remotes.FindAsync(id);
        if (remote == null) return false;

        // Remove audit read records
        var remoteAuditRecords = _dbContext.AuditReads_Remotes.Where(ar => ar.Remote_ID == id);
        _dbContext.AuditReads_Remotes.RemoveRange(remoteAuditRecords);

        // Remove audit records
        var auditRemotes = _dbContext.AuditRemotes.Where(ar => ar.Remote_ID == id);
        _dbContext.AuditRemotes.RemoveRange(auditRemotes);

        // Remove related tags
        var remoteTags = _dbContext.Tags_Remotes.Where(th => th.Remote_ID == id);
        _dbContext.Tags_Remotes.RemoveRange(remoteTags);

        // Remove attachments
        var attachments = _dbContext.Host_Remotes.Where(th => th.Remote_ID == id);
        _dbContext.Host_Remotes.RemoveRange(attachments);

        // Remove related versions
        var remoteVersions = _dbContext.Versions.Where(th => th.Remote_ID == id);
        _dbContext.Versions.RemoveRange(remoteVersions);

        // Remove related modules
        var remoteModules = _dbContext.RemoteModules.Where(th => th.Remote_ID == id);
        _dbContext.RemoteModules.RemoveRange(remoteModules);

        // If we are deleting a remote, lets delete any uploaded remotes...

        // Then delete the remote
        _dbContext.Remotes.Remove(remote);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<List<VersionResponse>> GetVersionsByRemoteIdAsync(int id)
    {
        // Get the remote to access its URL for comparison
        var remote = await _dbContext.Remotes
            .FirstOrDefaultAsync(r => r.Remote_ID == id);
            
        if (remote == null)
            return new List<VersionResponse>();
            
        var versions = await _dbContext.Versions
            .Where(v => v.Remote_ID == id)
            .OrderByDescending(v => v.Created_Date)
            .ToListAsync();

        return versions.Select(v => VersionMapper.ToResponse(v, remote.Url)).ToList();
    }
    
    public async Task<RemoteResponse?> SetCurrentVersionAsync(int id, string version)
    {
        // Find the remote
        var remote = await _dbContext.Remotes
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .FirstOrDefaultAsync(r => r.Remote_ID == id);
            
        if (remote == null) return null;
        
        // Verify the version exists
        var versionExists = await _dbContext.Versions
            .FirstOrDefaultAsync(v => v.Remote_ID == id && v.Value == version);
            
        if (versionExists == null) return null;
        
        remote.Url = versionExists.Url;
        remote.Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        
        await _dbContext.SaveChangesAsync();
        _ = _analyticsService.LogRemoteReadAsync(id, "SetCurrentVersion", 1);
        
        return RemoteMapper.ToResponse(remote);
    }
}
