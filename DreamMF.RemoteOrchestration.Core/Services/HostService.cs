using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class HostService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;
    private readonly IAnalyticsService _analyticsService;

    public HostService(IRemoteOrchestrationDbContext dbContext, IAnalyticsService analyticsService)
    {
        _dbContext = dbContext;
        _analyticsService = analyticsService;
    }

    public async Task<List<HostResponse>> GetAllHostsAsync()
    {
        if (_dbContext == null)
        {
            throw new HandledException(ExceptionType.Validation, "Database context cannot be null.");
        }
        var hosts = await _dbContext.Hosts.ToListAsync();
        var hostResponses = hosts.Select(HostMapper.ToResponse).ToList();
        foreach (var host in hosts)
        {
            _ = _analyticsService.LogHostReadAsync(host.Host_ID, "GetAll", 1);
        }
        return hostResponses;
    }

    public async Task<HostResponse?> GetHostByIdAsync(int id)
    {
        if (id <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "ID must be greater than zero.");
        }
        var host = await _dbContext.Hosts.FindAsync(id);
        if (host != null)
        {
            _ = _analyticsService.LogHostReadAsync(host.Host_ID, "GetById", 1);
        }
        return host != null ? HostMapper.ToResponse(host) : null;
    }

    public async Task<HostResponse> CreateHostAsync(HostRequest request)
    {
        if (request == null)
        {
            throw new HandledException(ExceptionType.Validation, "Request cannot be null.");
        }
        var host = HostMapper.ToEntity(request);
        _dbContext.Hosts.Add(host);
        await _dbContext.SaveChangesAsync();
        return HostMapper.ToResponse(host);
    }

    public async Task<bool> UpdateHostAsync(int id, HostRequest request)
    {
        if (id <= 0 || request == null)
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        var existingHost = await _dbContext.Hosts.FindAsync(id);
        if (existingHost == null) return false;

        existingHost.Name = request.Name;
        existingHost.Description = request.Description;
        existingHost.Url = request.Url;
        existingHost.Environment = request.Environment;
        existingHost.Updated_Date = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteHostAsync(int id)
    {
        if (id <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "ID must be greater than zero.");
        }
        var host = await _dbContext.Hosts.FindAsync(id);
        if (host == null) return false;

        _dbContext.Hosts.Remove(host);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<List<HostResponse>> GetHostsByEnvironmentAsync(string environment)
    {
        if (string.IsNullOrWhiteSpace(environment))
        {
            throw new HandledException(ExceptionType.Validation, "Environment cannot be null or empty.");
        }
        var hosts = await _dbContext.Hosts
            .Where(h => h.Environment == environment)
            .ToListAsync();
        return hosts.Select(HostMapper.ToResponse).ToList();
    }

    public async Task<List<RemoteResponse>> GetRemotesByHostIdAsync(int hostId)
    {
        if (hostId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "Host ID must be greater than zero.");
        }
        var remotes = _dbContext.Host_Remotes
            .Where(hr => hr.Host_ID == hostId)
            .Select(hr => hr.Remote_ID);
        return await _dbContext.Remotes
            .Where(r => remotes.Contains(r.Remote_ID))
            .Select(r => r.ToResponse())
            .ToListAsync();
    }

    public async Task<bool> AttachRemoteToHostAsync(int hostId, int remoteId)
    {
        if (hostId <= 0 || remoteId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }
        if (!await _dbContext.Hosts.AnyAsync(h => h.Host_ID == hostId) ||
            !await _dbContext.Remotes.AnyAsync(r => r.Remote_ID == remoteId))
        {
            return false;
        }

        var hostRemote = new Host_Remote { Host_ID = hostId, Remote_ID = remoteId };
        _dbContext.Host_Remotes.Add(hostRemote);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
