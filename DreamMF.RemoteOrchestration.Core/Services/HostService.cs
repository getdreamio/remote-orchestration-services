using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using DreamMF.RemoteOrchestration.Core.Mappers;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class HostService
{
    private readonly RemoteOrchestrationDbContext _dbContext;

    public HostService(RemoteOrchestrationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<HostResponse>> GetAllHostsAsync()
    {
        var hosts = await _dbContext.Hosts.ToListAsync();
        return hosts.Select(HostMapper.ToResponse).ToList();
    }

    public async Task<HostResponse?> GetHostByIdAsync(int id)
    {
        var host = await _dbContext.Hosts.FindAsync(id);
        return host != null ? HostMapper.ToResponse(host) : null;
    }

    public async Task<HostResponse> CreateHostAsync(HostRequest request)
    {
        var host = HostMapper.ToEntity(request);
        _dbContext.Hosts.Add(host);
        await _dbContext.SaveChangesAsync();
        return HostMapper.ToResponse(host);
    }

    public async Task<bool> UpdateHostAsync(int id, HostRequest request)
    {
        var existingHost = await _dbContext.Hosts.FindAsync(id);
        if (existingHost == null) return false;

        existingHost.Name = request.Name;
        existingHost.Url = request.Url;

        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteHostAsync(int id)
    {
        var host = await _dbContext.Hosts.FindAsync(id);
        if (host == null) return false;

        _dbContext.Hosts.Remove(host);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<List<HostResponse>> GetHostsByEnvironmentAsync(string environment)
    {
        var hosts = await _dbContext.Hosts
            .Where(h => h.Environment == environment)
            .ToListAsync();
        return hosts.Select(HostMapper.ToResponse).ToList();
    }
}
