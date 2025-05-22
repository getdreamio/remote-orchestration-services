using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IDreamService
{
    Task<DreamHostResponse?> GetHostDetailsByAccessKey(string accessKey);
    Task<List<DreamRemoteResponse>> GetAttachedRemotesByAccessKey(string accessKey);
    Task<RemoteSummaryResponse?> GetRemoteByAccessKeyAndName(string accessKey, string key);
    Task<List<HostVariableResponse>> GetHostVariablesByAccessKey(string accessKey);
}

public class DreamService : IDreamService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;

    public DreamService(IRemoteOrchestrationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DreamHostResponse?> GetHostDetailsByAccessKey(string accessKey)
    {
        var host = await _dbContext.Hosts
            .FirstOrDefaultAsync(h => h.Key == accessKey);
        return host != null ? HostMapper.ToDreamResponse(host) : null;
    }

    public async Task<List<DreamRemoteResponse>> GetAttachedRemotesByAccessKey(string accessKey)
    {
        var host = await GetHostDetailsByAccessKey(accessKey);
        if (host == null) return new List<DreamRemoteResponse>();

        var hostRemotes = await _dbContext.Host_Remotes
            .Include(hr => hr.Remote)
                .ThenInclude(r => r!.RemoteModules)
                    .ThenInclude(rm => rm.Module)
            .Where(hr => hr.Host_ID == host.Id)
            .ToListAsync();

        var result = new List<DreamRemoteResponse>();
        foreach (var hr in hostRemotes)
        {
            if (hr.Remote != null)
            {
                var response = RemoteMapper.ToDreamResponse(hr.Remote);
                if (hr.UrlOverride == "latest") {
                    // First fetch all versions for this remote
                    var versions = await _dbContext.Versions
                        .Where(v => v.Remote_ID == hr.Remote.Remote_ID)
                        .ToListAsync();
                    
                    // Then map and filter on the client side
                    var mappedVersions = versions
                        .Select(v => VersionMapper.ToResponse(v, hr.Remote.Url))
                        .ToList();
                    
                    // Find the current version
                    var currentVersion = mappedVersions.FirstOrDefault(v => v.IsCurrent);
                    
                    if (currentVersion != null) {
                        response.Url = currentVersion.Url;
                    }
                } else {
                    response.Url = !string.IsNullOrEmpty(hr.UrlOverride) ? hr.UrlOverride : hr.Remote.Url;
                }
                result.Add(response);
            }
        }
        return result;
    }

    public async Task<RemoteSummaryResponse?> GetRemoteByAccessKeyAndName(string accessKey, string key)
    {
        var host = await GetHostDetailsByAccessKey(accessKey);
        if (host == null) return null;

        var hostRemote = await _dbContext.Host_Remotes
            .Include(hr => hr.Remote)
            .Include(hr => hr.Remote!.RemoteModules)
                .ThenInclude(rm => rm.Module)
            .FirstOrDefaultAsync(r => r.Host_ID == host.Id && r.Remote!.Key == key);

        if (hostRemote == null || hostRemote.Remote == null) return null;

        var response = RemoteMapper.ToSummaryResponse(hostRemote.Remote);
        // Use UrlOverride if available, otherwise use the remote's URL
        response.Url = !string.IsNullOrEmpty(hostRemote.UrlOverride) ? hostRemote.UrlOverride : hostRemote.Remote.Url;
        return response;
    }

    public async Task<List<HostVariableResponse>> GetHostVariablesByAccessKey(string accessKey)
    {
        var host = await _dbContext.Hosts
            .FirstOrDefaultAsync(h => h.Key == accessKey);
            
        if (host == null) return new List<HostVariableResponse>();
        
        var variables = await _dbContext.HostVariables
            .Where(hv => hv.Host_ID == host.Host_ID)
            .ToListAsync();
            
        return variables.Select(v => HostVariableMapper.ToResponse(v)).ToList();
    }
}
