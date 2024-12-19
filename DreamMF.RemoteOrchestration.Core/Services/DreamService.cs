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
}
