using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class TagService
{
    private readonly RemoteOrchestrationDbContext _dbContext;

    public TagService(RemoteOrchestrationDbContext dbContext)
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

            existingTag.Text = request.Text;

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

    public async Task<bool> AddTagToRemoteAsync(int remoteId, int tagId)
    {
        if (remoteId <= 0 || tagId <= 0)
        {
            throw new HandledException(ExceptionType.Validation, "IDs must be greater than zero.");
        }
        try
        {
            if (!await _dbContext.Remotes.AnyAsync(r => r.Id == remoteId) ||
                !await _dbContext.Tags.AnyAsync(t => t.Tag_ID == tagId))
            {
                return false;
            }

            var tagRemote = new Tags_Remote { Remote_ID = remoteId, Tag_ID = tagId };
            _dbContext.Tags_Remotes.Add(tagRemote);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to add tag to remote", ex);
        }
    }

    public async Task<bool> AddTagToHostAsync(int hostId, int tagId)
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

            var tagHost = new Tags_Host { Host_ID = hostId, Tag_ID = tagId };
            _dbContext.Tags_Hosts.Add(tagHost);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to add tag to host", ex);
        }
    }
}
