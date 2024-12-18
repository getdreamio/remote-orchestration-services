using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class RemoteService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;

    public RemoteService(IRemoteOrchestrationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<RemoteResponse>> GetAllRemotesAsync()
    {
        var remotes = await _dbContext.Remotes
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .ToListAsync();

        return remotes.Select(RemoteMapper.ToResponse).ToList();
    }

    public async Task<RemoteResponse?> GetRemoteByIdAsync(int id)
    {
        var remote = await _dbContext.Remotes
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .FirstOrDefaultAsync(r => r.Remote_ID == id);

        return remote != null ? RemoteMapper.ToResponse(remote) : null;
    }

    public async Task<RemoteResponse> CreateRemoteAsync(RemoteRequest request)
    {
        var remote = RemoteMapper.ToEntity(request);
        
        // Add modules
        foreach (var moduleName in request.Modules)
        {
            var module = await _dbContext.Modules.FirstOrDefaultAsync(m => m.Name == moduleName);
            if (module == null)
            {
                module = new Module
                {
                    Name = moduleName,
                    Created_Date = DateTimeOffset.UtcNow,
                    Updated_Date = DateTimeOffset.UtcNow
                };
                _dbContext.Modules.Add(module);
                await _dbContext.SaveChangesAsync();
            }

            remote.RemoteModules.Add(new RemoteModule
            {
                Module_ID = module.Module_ID,
                Created_Date = DateTimeOffset.UtcNow,
                Updated_Date = DateTimeOffset.UtcNow
            });
        }

        _dbContext.Remotes.Add(remote);
        await _dbContext.SaveChangesAsync();

        return await GetRemoteByIdAsync(remote.Remote_ID);
    }

    public async Task<bool> UpdateRemoteAsync(int id, RemoteRequest request)
    {
        var remote = await _dbContext.Remotes
            .Include(r => r.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .FirstOrDefaultAsync(r => r.Remote_ID == id);

        if (remote == null) return false;

        remote.Name = request.Name;
        remote.Scope = request.Scope;
        remote.Updated_Date = DateTimeOffset.UtcNow;

        // Update modules
        var currentModuleNames = remote.RemoteModules.Select(rm => rm.Module.Name).ToList();
        var modulesToAdd = request.Modules.Except(currentModuleNames);
        var modulesToRemove = currentModuleNames.Except(request.Modules);

        // Remove modules
        foreach (var moduleName in modulesToRemove)
        {
            var moduleToRemove = remote.RemoteModules.FirstOrDefault(rm => rm.Module.Name == moduleName);
            if (moduleToRemove != null)
            {
                remote.RemoteModules.Remove(moduleToRemove);
            }
        }

        // Add new modules
        foreach (var moduleName in modulesToAdd)
        {
            var module = await _dbContext.Modules.FirstOrDefaultAsync(m => m.Name == moduleName);
            if (module == null)
            {
                module = new Module
                {
                    Name = moduleName,
                    Created_Date = DateTimeOffset.UtcNow,
                    Updated_Date = DateTimeOffset.UtcNow
                };
                _dbContext.Modules.Add(module);
                await _dbContext.SaveChangesAsync();
            }

            remote.RemoteModules.Add(new RemoteModule
            {
                Module_ID = module.Module_ID,
                Created_Date = DateTimeOffset.UtcNow,
                Updated_Date = DateTimeOffset.UtcNow
            });
        }

        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteRemoteAsync(int id)
    {
        var remote = await _dbContext.Remotes.FindAsync(id);
        if (remote == null) return false;

        _dbContext.Remotes.Remove(remote);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
