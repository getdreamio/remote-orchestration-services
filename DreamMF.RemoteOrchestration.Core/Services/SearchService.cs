using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using DreamMF.RemoteOrchestration.Database;
using Microsoft.EntityFrameworkCore;
using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class SearchService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;

    public SearchService(IRemoteOrchestrationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Models.SearchResponse> SearchAsync(string searchText)
    {
        if (string.IsNullOrWhiteSpace(searchText))
        {
            throw new HandledException(ExceptionType.Validation, "Search text cannot be empty");
        }

        try
        {
            var searchLower = searchText.ToLowerInvariant();

            // Search in Hosts
            var hosts = await _dbContext.Hosts
                .Where(h => h.Name.ToLower().Contains(searchLower) ||
                           h.Description.ToLower().Contains(searchLower))
                .Union(_dbContext.Hosts
                    .Join(_dbContext.Tags_Hosts,
                        h => h.Host_ID,
                        th => th.Host_ID,
                        (h, th) => new { Host = h, TagHost = th })
                    .Join(_dbContext.Tags,
                        j => j.TagHost.Tag_ID,
                        t => t.Tag_ID,
                        (j, t) => new { j.Host, j.TagHost, Tag = t })
                    .Where(j => j.Tag.Key.ToLower().Contains(searchLower) ||
                               j.TagHost.Value.ToLower().Contains(searchLower))
                    .Select(j => j.Host))
                .ToListAsync();

            // Search in Remotes
            var remotes = await _dbContext.Remotes
                .Where(r => r.Name.ToLower().Contains(searchLower) ||
                           r.Key.ToLower().Contains(searchLower))
                .Union(_dbContext.Remotes
                    .Join(_dbContext.Tags_Remotes,
                        r => r.Remote_ID,
                        tr => tr.Remote_ID,
                        (r, tr) => new { Remote = r, TagRemote = tr })
                    .Join(_dbContext.Tags,
                        j => j.TagRemote.Tag_ID,
                        t => t.Tag_ID,
                        (j, t) => new { j.Remote, j.TagRemote, Tag = t })
                    .Where(j => j.Tag.Key.ToLower().Contains(searchLower) ||
                               j.TagRemote.Value.ToLower().Contains(searchLower))
                    .Select(j => j.Remote))
                .ToListAsync();

            return new Models.SearchResponse
            {
                Hosts = hosts.Select(HostMapper.ToResponse).ToList(),
                Remotes = remotes.Select(RemoteMapper.ToResponse).ToList()
            };
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Database, "Failed to perform search", ex);
        }
    }
}
