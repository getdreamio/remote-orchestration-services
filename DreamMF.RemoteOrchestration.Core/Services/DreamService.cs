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
    Task<RemoteSummaryResponse> GetRemoteByAccessKeyAndName(string accessKey, string key);
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
            .Select(r => RemoteMapper.ToResponse(r))
            .ToListAsync();
    }

    public async Task<RemoteSummaryResponse> GetRemoteByAccessKeyAndName(string accessKey, string key)
    {
        var host = await GetHostDetailsByAccessKey(accessKey);
        var remote = await _dbContext.Host_Remotes
            .Include(hr => hr.Remote)
            .Include(hr => hr.Remote.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .FirstOrDefaultAsync(r => r.Host_ID == host.Id && r.Remote.Key == key);
        return remote != null ? RemoteMapper.ToSummaryResponse(remote.Remote) : null;
    }
}
