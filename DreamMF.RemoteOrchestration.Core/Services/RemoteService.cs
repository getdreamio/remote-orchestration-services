using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Core.Exceptions;
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
        try
        {
            var remotes = await _dbContext.Remotes.ToListAsync();
            return remotes.Select(RemoteMapper.ToResponse).ToList();
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to retrieve remotes", ex);
        }
    }

    public async Task<RemoteResponse?> GetRemoteByIdAsync(int id)
    {
        if (id <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "ID must be greater than zero.");
        }
        try
        {
            var remote = await _dbContext.Remotes.FindAsync(id);
            return remote != null ? RemoteMapper.ToResponse(remote) : null;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to retrieve remote by ID", ex);
        }
    }

    public async Task<RemoteResponse> CreateRemoteAsync(RemoteRequest request)
    {
        if (request == null)
        {
            throw new HandledException(ExceptionType.Validation, "Request cannot be null.");
        }
        try
        {
            var remote = RemoteMapper.ToEntity(request);
            _dbContext.Remotes.Add(remote);
            await _dbContext.SaveChangesAsync();
            return RemoteMapper.ToResponse(remote);
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to create remote", ex);
        }
    }

    public async Task<bool> UpdateRemoteAsync(int id, RemoteRequest request)
    {
        if (id <= 0 || request == null)
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        try
        {
            var existingRemote = await _dbContext.Remotes.FindAsync(id);
            if (existingRemote == null) return false;

            existingRemote.Name = request.Name;
            existingRemote.Configuration = request.Configuration;

            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to update remote", ex);
        }
    }

    public async Task<bool> DeleteRemoteAsync(int id)
    {
        if (id <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "ID must be greater than zero.");
        }
        try
        {
            var remote = await _dbContext.Remotes.FindAsync(id);
            if (remote == null) return false;

            _dbContext.Remotes.Remove(remote);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to delete remote", ex);
        }
    }
}
