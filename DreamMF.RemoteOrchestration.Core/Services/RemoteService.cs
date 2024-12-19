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
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .ToListAsync();

        var remoteResponses = remotes.Select(RemoteMapper.ToResponse).ToList();
        return remoteResponses;
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
        
        foreach (var module in request.Modules.Where(m => m.Id == 0))
        {
            var newModule = new Module
            {
                Name = module.Name,
                Created_Date = DateTimeOffset.UtcNow,
                Updated_Date = DateTimeOffset.UtcNow
            };
            _dbContext.Modules.Add(newModule);
            await _dbContext.SaveChangesAsync();

            remote.RemoteModules.Add(new RemoteModule
            {
                Module_ID = newModule.Module_ID,
                Created_Date = DateTimeOffset.UtcNow,
                Updated_Date = DateTimeOffset.UtcNow
            });
        }

        _dbContext.Remotes.Add(remote);
        await _dbContext.SaveChangesAsync();
        _ = _analyticsService.LogRemoteReadAsync(remote.Remote_ID, "Create", 1);

        return await GetRemoteByIdAsync(remote.Remote_ID);
    }

    public async Task<bool> UpdateRemoteAsync(int id, RemoteRequest request)
    {
        var remote = await _dbContext.Remotes
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .FirstOrDefaultAsync(r => r.Remote_ID == id);

        if (remote == null) return false;

        // Update basic properties
        remote.Name = request.Name;
        remote.Scope = request.Scope;
        remote.Updated_Date = DateTimeOffset.UtcNow;

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
                        Created_Date = DateTimeOffset.UtcNow,
                        Updated_Date = DateTimeOffset.UtcNow
                    };
                    _dbContext.Modules.Add(module);
                }

                remote.RemoteModules.Add(new RemoteModule
                {
                    Module = module,
                    Created_Date = DateTimeOffset.UtcNow,
                    Updated_Date = DateTimeOffset.UtcNow
                });
            }
        }

        await _dbContext.SaveChangesAsync();
        _ = _analyticsService.LogRemoteReadAsync(id, "Update", 1);
        return true;
    }

    public async Task<bool> DeleteRemoteAsync(int id)
    {
        var remote = await _dbContext.Remotes.FindAsync(id);
        if (remote == null) return false;

        _dbContext.Remotes.Remove(remote);
        await _dbContext.SaveChangesAsync();
        _ = _analyticsService.LogRemoteReadAsync(id, "Delete", 1);
        return true;
    }
}
