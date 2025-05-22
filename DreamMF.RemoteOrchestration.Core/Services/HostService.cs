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
        var hosts = await _dbContext.Hosts.Include(h => h.Host_Remotes).ToListAsync();
        var hostResponses = hosts.Select(HostMapper.ToResponse).ToList();
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
            _ = _analyticsService.LogHostReadAsync(host.Host_ID, "Read", 1);
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
        _ = _analyticsService.LogHostReadAsync(host.Host_ID, "Create", 1);
        return HostMapper.ToResponse(host);
    }

    public async Task<HostResponse> UpdateHostAsync(int id, HostRequest request)
    {
        if (id <= 0 || request == null)
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        var existingHost = await _dbContext.Hosts.FindAsync(id);
        if (existingHost == null) return null;

        existingHost.Name = request.Name;
        existingHost.Description = request.Description;
        existingHost.Url = request.Url;
        existingHost.Environment = request.Environment;
        existingHost.Repository = request.Repository;
        existingHost.Contact_Name = request.ContactName;
        existingHost.Contact_Email = request.ContactEmail;
        existingHost.Documentation_Url = request.DocumentationUrl;
        existingHost.Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        await _dbContext.SaveChangesAsync();
        _ = _analyticsService.LogHostReadAsync(id, "Update", 1);
        return HostMapper.ToResponse(existingHost);
    }

    public async Task<bool> DeleteHostAsync(int id)
    {
        if (id <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "ID must be greater than zero.");
        }
        var host = await _dbContext.Hosts.FindAsync(id);
        if (host == null) return false;

        // Remove audit records
        var hostAuditRecords = _dbContext.AuditReads_Hosts.Where(ar => ar.Host_ID == id);
        _dbContext.AuditReads_Hosts.RemoveRange(hostAuditRecords);

        // Remove related tags
        var hostTags = _dbContext.Tags_Hosts.Where(th => th.Host_ID == id);
        _dbContext.Tags_Hosts.RemoveRange(hostTags);

        // Delete related child entities
        var hostRemotes = _dbContext.Host_Remotes.Where(hr => hr.Host_ID == id);
        _dbContext.Host_Remotes.RemoveRange(hostRemotes);

        // Remove the host
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
        
        // First get the host-remote relationships with remotes included
        var hostRemotes = await _dbContext.Host_Remotes
            .Where(hr => hr.Host_ID == hostId)
            .Include(hr => hr.Remote)
            .ToListAsync();
        
        // Then map to RemoteResponse objects after the query has executed
        var remotes = hostRemotes
            .Where(hr => hr.Remote != null)
            .Select(hr => {
                var result = RemoteMapper.ToResponse(hr.Remote!);
                // If UrlOverride is not null, use it instead of the remote's URL
                if (!string.IsNullOrEmpty(hr.UrlOverride))
                {
                    result.Url = hr.UrlOverride;
                }
                return result;
            })
            .ToList();

        return remotes;
    }

    public async Task<HostRemoteResponse?> AttachRemoteToHostAsync(int hostId, int remoteId)
    {
        if (hostId <= 0 || remoteId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }
        if (!await _dbContext.Hosts.AnyAsync(h => h.Host_ID == hostId) ||
            !await _dbContext.Remotes.AnyAsync(r => r.Remote_ID == remoteId))
        {
            return null;
        }

        var hostRemote = new Host_Remote { 
            Host_ID = hostId, 
            Remote_ID = remoteId,
            Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };
        _dbContext.Host_Remotes.Add(hostRemote);
        await _dbContext.SaveChangesAsync();
        return hostRemote.ToResponse();
    }

    public async Task<HostRemoteResponse?> DetachRemoteFromHostAsync(int hostId, int remoteId)
    {
        if (hostId <= 0 || remoteId <= 0)
        {
                throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }
        if (!await _dbContext.Hosts.AnyAsync(h => h.Host_ID == hostId) ||
            !await _dbContext.Remotes.AnyAsync(r => r.Remote_ID == remoteId))
        {
            return null;
        }

        var hostRemote = await _dbContext.Host_Remotes
            .FirstOrDefaultAsync(hr => hr.Host_ID == hostId && hr.Remote_ID == remoteId);
        if (hostRemote == null) return null;
        
        // Create a response before removing the entity
        var response = hostRemote.ToResponse();
        
        _dbContext.Host_Remotes.Remove(hostRemote);
        await _dbContext.SaveChangesAsync();
        return response;
    }

    public async Task<HostRemoteResponse?> SetCurrentVersionOverrideAsync(int hostId, int remoteId, string? url)
    {
        if (hostId <= 0 || remoteId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }
        
        // Check if the host and remote exist
        if (!await _dbContext.Hosts.AnyAsync(h => h.Host_ID == hostId) ||
            !await _dbContext.Remotes.AnyAsync(r => r.Remote_ID == remoteId))
        {
            return null;
        }

        // Get the host-remote relationship
        var hostRemote = await _dbContext.Host_Remotes
            .FirstOrDefaultAsync(hr => hr.Host_ID == hostId && hr.Remote_ID == remoteId);
        
        if (hostRemote == null)
        {
            // If the relationship doesn't exist, create it
            hostRemote = new Host_Remote
            {
                Host_ID = hostId,
                Remote_ID = remoteId,
                UrlOverride = url ?? "latest",
                Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
            _dbContext.Host_Remotes.Add(hostRemote);
        }
        else
        {
            // Update the existing relationship
            hostRemote.UrlOverride = url;
            hostRemote.Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        await _dbContext.SaveChangesAsync();
        return hostRemote.ToResponse();
    }

    // Host Variables CRUD operations
    public async Task<List<HostVariableResponse>> GetHostVariablesAsync(int hostId)
    {
        if (hostId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "Host ID must be greater than zero.");
        }
        
        var variables = await _dbContext.HostVariables
            .Where(hv => hv.Host_ID == hostId)
            .ToListAsync();
            
        return variables.Select(v => v.ToResponse()).ToList();
    }
    
    public async Task<HostVariableResponse?> GetHostVariableByIdAsync(int hostId, int variableId)
    {
        if (hostId <= 0 || variableId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }
        
        var variable = await _dbContext.HostVariables
            .FirstOrDefaultAsync(hv => hv.Host_ID == hostId && hv.HostVariable_ID == variableId);
            
        return variable != null ? variable.ToResponse() : null;
    }
    
    public async Task<HostVariableResponse?> GetHostVariableByKeyAsync(int hostId, string key)
    {
        if (hostId <= 0 || string.IsNullOrWhiteSpace(key))
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        
        var variable = await _dbContext.HostVariables
            .FirstOrDefaultAsync(hv => hv.Host_ID == hostId && hv.Key == key);
            
        return variable != null ? variable.ToResponse() : null;
    }
    
    public async Task<HostVariableResponse> CreateHostVariableAsync(int hostId, HostVariableRequest request)
    {
        if (hostId <= 0 || request == null)
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        
        // Check if host exists
        var hostExists = await _dbContext.Hosts.AnyAsync(h => h.Host_ID == hostId);
        if (!hostExists)
        {
            throw new HandledException(ExceptionType.Validation, $"Host with ID {hostId} not found.");
        }
        
        // Check if key already exists for this host
        var keyExists = await _dbContext.HostVariables
            .AnyAsync(hv => hv.Host_ID == hostId && hv.Key == request.Key);
            
        if (keyExists)
        {
            throw new HandledException(ExceptionType.Validation, $"A variable with key '{request.Key}' already exists for this host.");
        }
        
        var variable = HostVariableMapper.ToEntity(request, hostId);
        _dbContext.HostVariables.Add(variable);
        await _dbContext.SaveChangesAsync();
        
        return variable.ToResponse();
    }
    
    public async Task<HostVariableResponse?> UpdateHostVariableAsync(int hostId, int variableId, HostVariableRequest request)
    {
        if (hostId <= 0 || variableId <= 0 || request == null)
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        
        var variable = await _dbContext.HostVariables
            .FirstOrDefaultAsync(hv => hv.Host_ID == hostId && hv.HostVariable_ID == variableId);
            
        if (variable == null) return null;
        
        // Check if the new key already exists (if key is being changed)
        if (variable.Key != request.Key)
        {
            var keyExists = await _dbContext.HostVariables
                .AnyAsync(hv => hv.Host_ID == hostId && hv.Key == request.Key && hv.HostVariable_ID != variableId);
                
            if (keyExists)
            {
                throw new HandledException(ExceptionType.Validation, $"A variable with key '{request.Key}' already exists for this host.");
            }
        }
        
        variable.Key = request.Key;
        variable.Value = request.Value;
        variable.Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        
        await _dbContext.SaveChangesAsync();
        return variable.ToResponse();
    }
    
    public async Task<bool> DeleteHostVariableAsync(int hostId, int variableId)
    {
        if (hostId <= 0 || variableId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }
        
        var variable = await _dbContext.HostVariables
            .FirstOrDefaultAsync(hv => hv.Host_ID == hostId && hv.HostVariable_ID == variableId);
            
        if (variable == null) return false;
        
        _dbContext.HostVariables.Remove(variable);
        await _dbContext.SaveChangesAsync();
        return true;
    }
    
    public async Task<bool> DeleteHostVariableByKeyAsync(int hostId, string key)
    {
        if (hostId <= 0 || string.IsNullOrWhiteSpace(key))
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        
        var variable = await _dbContext.HostVariables
            .FirstOrDefaultAsync(hv => hv.Host_ID == hostId && hv.Key == key);
            
        if (variable == null) return false;
        
        _dbContext.HostVariables.Remove(variable);
        await _dbContext.SaveChangesAsync();
        return true;
    }
    
    /// <summary>
    /// Gets all variables for a host using the host's access key
    /// </summary>
    /// <param name="accessKey">The host's access key</param>
    /// <returns>A list of host variables or null if the host is not found</returns>
    public async Task<List<HostVariableResponse>?> GetHostVariablesByAccessKeyAsync(string accessKey)
    {
        if (string.IsNullOrWhiteSpace(accessKey))
        {
            throw new HandledException(ExceptionType.Validation, "Access key cannot be null or empty.");
        }
        
        // Find the host with the given access key
        var host = await _dbContext.Hosts
            .FirstOrDefaultAsync(h => h.Key == accessKey);
            
        if (host == null) return null;
        
        // Get all variables for this host
        var variables = await _dbContext.HostVariables
            .Where(hv => hv.Host_ID == host.Host_ID)
            .ToListAsync();
            
        return variables.Select(v => v.ToResponse()).ToList();
    }
}
