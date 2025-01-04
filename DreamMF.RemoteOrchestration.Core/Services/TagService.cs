using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class TagService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;

    public TagService(IRemoteOrchestrationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<TagResponse>> GetAllTagsAsync()
    {
        try
        {
            var tags = await _dbContext.Tags.ToListAsync();
            return tags.Select(TagMapper.ToResponse).ToList();
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to retrieve tags", ex);
        }
    }

    public async Task<TagResponse?> GetTagByIdAsync(int id)
    {
        if (id <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "ID must be greater than zero.");
        }
        try
        {
            var tag = await _dbContext.Tags.FindAsync(id);
            return tag != null ? TagMapper.ToResponse(tag) : null;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to retrieve tag by ID", ex);
        }
    }

    public async Task<TagResponse> CreateTagAsync(TagRequest request)
    {
        if (request == null)
        {
            throw new HandledException(ExceptionType.Validation, "Request cannot be null.");
        }
        try
        {
            var tag = TagMapper.ToEntity(request);
            _dbContext.Tags.Add(tag);
            await _dbContext.SaveChangesAsync();
            return TagMapper.ToResponse(tag);
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to create tag", ex);
        }
    }

    public async Task<bool> UpdateTagAsync(int id, TagRequest request)
    {
        if (id <= 0 || request == null)
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        try
        {
            var existingTag = await _dbContext.Tags.FindAsync(id);
            if (existingTag == null) return false;

            existingTag.Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            existingTag.Key = request.Key;
            existingTag.Display_Name = request.Display_Name;
            
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to update tag", ex);
        }
    }

    public async Task<bool> DeleteTagAsync(int id)
    {
        if (id <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "ID must be greater than zero.");
        }
        try
        {
            var tag = await _dbContext.Tags.FindAsync(id);
            if (tag == null) return false;

            _dbContext.Tags.Remove(tag);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to delete tag", ex);
        }
    }

    public async Task<bool> AddTagToRemoteAsync(int remoteId, int tagId, string value)
    {
        if (remoteId <= 0 || tagId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }
        try
        {
            if (!await _dbContext.Remotes.AnyAsync(r => r.Remote_ID == remoteId) ||
                !await _dbContext.Tags.AnyAsync(t => t.Tag_ID == tagId))
            {
                return false;
            }

            var tagRemote = new Tags_Remote { 
                Remote_ID = remoteId, 
                Tag_ID = tagId,
                Value = value,
                Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
            _dbContext.Tags_Remotes.Add(tagRemote);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to add tag to remote", ex);
        }
    }

    public async Task<bool> AddTagToHostAsync(int hostId, int tagId, string value)
    {
        if (hostId <= 0 || tagId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }
        try
        {
            if (!await _dbContext.Hosts.AnyAsync(h => h.Host_ID == hostId) ||
                !await _dbContext.Tags.AnyAsync(t => t.Tag_ID == tagId))
            {
                return false;
            }

            var tagHost = new Tags_Host { 
                Host_ID = hostId, 
                Tag_ID = tagId,
                Value = value,
                Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
            _dbContext.Tags_Hosts.Add(tagHost);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to add tag to host", ex);
        }
    }

    public async Task<List<TagResponse>> GetTagsByHostIdAsync(int hostId)
    {
        if (hostId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "Host ID must be greater than zero.");
        }
        try
        {
            var tags = await _dbContext.Tags_Hosts
                .Where(th => th.Host_ID == hostId)
                .Select(th => th.Tag)
                .ToListAsync();
            return tags.Select(TagMapper.ToResponse).ToList();
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to retrieve tags by host ID", ex);
        }
    }

    public async Task<bool> RemoveTagFromHostAsync(int hostId, int tagId)
    {
        if (hostId <= 0 || tagId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }
        try
        {
            var tag = await _dbContext.Tags_Hosts
                .FirstOrDefaultAsync(r => r.Host_ID == hostId && r.Tag_ID == tagId);
            if (tag == null) return false;

            _dbContext.Tags_Hosts.Remove(tag);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to remove tag from host", ex);
        }
    }

    public async Task<List<TagResponse>> GetTagsByRemoteIdAsync(int remoteId)
    {
        if (remoteId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "Remote ID must be greater than zero.");
        }
        try
        {
            var tags = await _dbContext.Tags_Remotes
                .Where(tr => tr.Remote_ID == remoteId)
                .Select(tr => tr.Tag)
                .ToListAsync();
            return tags.Select(TagMapper.ToResponse).ToList();
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to retrieve tags by remote ID", ex);
        }
    }

    public async Task<bool> RemoveTagFromRemoteAsync(int remoteId, int tagId)
    {
        if (remoteId <= 0 || tagId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }

        try
        {
            var tag = await _dbContext.Tags_Remotes
                .FirstOrDefaultAsync(r => r.Remote_ID == remoteId && r.Tag_ID == tagId);
            if (tag == null) return false;

            _dbContext.Tags_Remotes.Remove(tag);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to remove tag from remote", ex);
        }
    }

    public async Task<List<HostResponse>> GetTagHosts(int tagId)
    {
        if (tagId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "Tag ID must be greater than zero.");
        }

        try
        {
            var hosts = await _dbContext.Tags_Hosts
                .Where(tr => tr.Tag_ID == tagId)
                .Include(tr => tr.Host)
                .Select(tr => tr.Host)
                .ToListAsync();

            return hosts.Select(HostMapper.ToResponse).ToList();
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to retrieve hosts for tag", ex);
        }
    }

    public async Task<List<RemoteResponse>> GetTagRemotes(int tagId)
    {
        if (tagId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "Tag ID must be greater than zero.");
        }

        try
        {
            var remotes = await _dbContext.Tags_Remotes
                .Where(tr => tr.Tag_ID == tagId)
                .Include(tr => tr.Remote)
                .Select(tr => tr.Remote)
                .ToListAsync();

            return remotes.Select(RemoteMapper.ToResponse).ToList();
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to retrieve remotes for tag", ex);
        }
    }
}
