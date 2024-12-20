using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IDreamService
{
    Task<HostResponse> GetHostDetailsByAccessKey(string accessKey);
    Task<List<RemoteResponse>> GetAttachedRemotesByAccessKey(string accessKey);
    Task<RemoteResponse> GetRemoteByAccessKeyAndName(string accessKey, string name);
}

public class DreamService : IDreamService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;

    public DreamService(IRemoteOrchestrationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HostResponse> GetHostDetailsByAccessKey(string accessKey)
    {
        var host = await _dbContext.Hosts
            .FirstOrDefaultAsync(h => h.Key == accessKey);
        return host != null ? HostMapper.ToResponse(host) : null;
    }

    public async Task<List<RemoteResponse>> GetAttachedRemotesByAccessKey(string accessKey)
    {
        var host = await GetHostDetailsByAccessKey(accessKey);
        var remotes = await _dbContext.Host_Remotes
            .Where(hr => hr.Host_ID == host.Id)
            .Select(hr => hr.Remote_ID)
            .ToListAsync();
        return await _dbContext.Remotes
            .Where(r => remotes.Contains(r.Remote_ID))
            .Select(r => r.ToResponse())
            .ToListAsync();
    }

    public async Task<RemoteResponse> GetRemoteByAccessKeyAndName(string accessKey, string name)
    {
        var host = await GetHostDetailsByAccessKey(accessKey);
        var remote = await _dbContext.Host_Remotes
            .Include(hr => hr.Remote)
            .FirstOrDefaultAsync(r => r.Host_ID == host.Id && r.Remote.Name == name);
        return remote != null ? RemoteMapper.ToResponse(remote.Remote) : null;
    }
}
