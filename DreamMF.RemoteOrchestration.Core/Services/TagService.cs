using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using DreamMF.RemoteOrchestration.Core.Mappers;
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
        var tags = await _dbContext.Tags.ToListAsync();
        return tags.Select(TagMapper.ToResponse).ToList();
    }

    public async Task<TagResponse?> GetTagByIdAsync(int id)
    {
        var tag = await _dbContext.Tags.FindAsync(id);
        return tag != null ? TagMapper.ToResponse(tag) : null;
    }

    public async Task<TagResponse> CreateTagAsync(TagRequest request)
    {
        var tag = TagMapper.ToEntity(request);
        _dbContext.Tags.Add(tag);
        await _dbContext.SaveChangesAsync();
        return TagMapper.ToResponse(tag);
    }

    public async Task<bool> UpdateTagAsync(int id, TagRequest request)
    {
        var existingTag = await _dbContext.Tags.FindAsync(id);
        if (existingTag == null) return false;

        existingTag.Text = request.Text;

        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteTagAsync(int id)
    {
        var tag = await _dbContext.Tags.FindAsync(id);
        if (tag == null) return false;

        _dbContext.Tags.Remove(tag);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddTagToRemoteAsync(int remoteId, int tagId)
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

    public async Task<bool> AddTagToHostAsync(int hostId, int tagId)
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
}
