using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using DreamMF.RemoteOrchestration.Core.Mappers;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class RemoteService
{
    private readonly RemoteOrchestrationDbContext _dbContext;

    public RemoteService(RemoteOrchestrationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<RemoteResponse>> GetAllRemotesAsync()
    {
        var remotes = await _dbContext.Remotes.ToListAsync();
        return remotes.Select(RemoteMapper.ToResponse).ToList();
    }

    public async Task<RemoteResponse?> GetRemoteByIdAsync(int id)
    {
        var remote = await _dbContext.Remotes.FindAsync(id);
        return remote != null ? RemoteMapper.ToResponse(remote) : null;
    }

    public async Task<RemoteResponse> CreateRemoteAsync(RemoteRequest request)
    {
        var remote = RemoteMapper.ToEntity(request);
        _dbContext.Remotes.Add(remote);
        await _dbContext.SaveChangesAsync();
        return RemoteMapper.ToResponse(remote);
    }

    public async Task<bool> UpdateRemoteAsync(int id, RemoteRequest request)
    {
        var existingRemote = await _dbContext.Remotes.FindAsync(id);
        if (existingRemote == null) return false;

        existingRemote.Name = request.Name;
        existingRemote.Configuration = request.Configuration;

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
