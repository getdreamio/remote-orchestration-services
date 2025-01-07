using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using DreamMF.RemoteOrchestration.Core.Configuration;
using DreamMF.RemoteOrchestration.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Data.Common;
using Microsoft.Data.Sqlite;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IAnalyticsService
{
    Task LogHostReadAsync(int hostId, string action, int userId);
    Task LogRemoteReadAsync(int remoteId, string action, int userId);
    Task CleanupOldRecordsAsync();
    
    // Analytics retrieval methods
    Task<List<EntityAnalytics>> GetHostAnalyticsAsync();
    Task<List<EntityAnalytics>> GetRemoteAnalyticsAsync();
    Task<List<DailyEntityAnalytics>> GetDailyHostAnalyticsAsync(int? hostId = null);
    Task<List<DailyEntityAnalytics>> GetDailyRemoteAnalyticsAsync(int? remoteId = null);
    Task<EntityAnalytics> GetHostAnalyticsByIdAsync(int hostId);
    Task<EntityAnalytics> GetRemoteAnalyticsByIdAsync(int remoteId);
    Task<DailyEntityAnalytics?> GetHostAnalyticsByIdAsync(string hostId);
    Task<DailyEntityAnalytics?> GetRemoteAnalyticsByIdAsync(string remoteId);
    Task<RecentRemoteAnalytics> GetRecentRemoteAnalyticsAsync();
    Task<RelationshipsModel> GetRelationships();
}

public class AnalyticsService : IAnalyticsService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;
    private readonly ILogger<AnalyticsService> _logger;
    private readonly AnalyticsConfig _config;

    public AnalyticsService(
        IRemoteOrchestrationDbContext dbContext,
        ILogger<AnalyticsService> logger,
        IOptions<AnalyticsConfig> config)
    {
        _dbContext = dbContext;
        _logger = logger;
        _config = config.Value;
    }

    public async Task LogHostReadAsync(int hostId, string action, int userId)
    {
        var audit = new AuditReads_Host
        {
            Host_ID = hostId,
            Action = action,
            User_ID = userId,
            Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };

        _dbContext.AuditReads_Hosts.Add(audit);
        await _dbContext.SaveChangesAsync();
    }

    public async Task LogRemoteReadAsync(int remoteId, string action, int userId)
    {
        var audit = new AuditReads_Remote
        {
            Remote_ID = remoteId,
            Action = action,
            User_ID = userId,
            Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };

        _dbContext.AuditReads_Remotes.Add(audit);
        await _dbContext.SaveChangesAsync();
    }

    public async Task CleanupOldRecordsAsync()
    {
        try
        {
            var cutoffDate = DateTimeOffset.UtcNow.AddDays(-_config.RetentionDays).ToUnixTimeMilliseconds();

            // Delete old host read records
            await _dbContext.AuditReads_Hosts
                .Where(a => a.Created_Date < cutoffDate)
                .ExecuteDeleteAsync();

            // Delete old remote read records
            await _dbContext.AuditReads_Remotes
                .Where(a => a.Created_Date < cutoffDate)
                .ExecuteDeleteAsync();

            _logger.LogInformation("Successfully cleaned up audit read records older than {CutoffDate}", cutoffDate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up old audit read records");
        }
    }

    public async Task<List<EntityAnalytics>> GetHostAnalyticsAsync()
    {
        return await _dbContext.Set<EntityAnalytics>()
            .FromSqlRaw(@"
                SELECT 
                    Host_ID as EntityId,
                    HostName as EntityName,
                    TotalReads,
                    TotalUpdates,
                    TotalCreates,
                    TotalDeletes,
                    Last30DaysActions
                FROM v_HostReadAnalytics
                ORDER BY Last30DaysActions DESC")
            .ToListAsync();
    }

    public async Task<List<EntityAnalytics>> GetRemoteAnalyticsAsync()
    {
        return await _dbContext.Set<EntityAnalytics>()
            .FromSqlRaw(@"
                SELECT 
                    Remote_ID as EntityId,
                    RemoteName as EntityName,
                    TotalReads,
                    TotalUpdates,
                    TotalCreates,
                    TotalDeletes,
                    Last30DaysActions
                FROM v_RemoteReadAnalytics
                ORDER BY Last30DaysActions DESC")
            .ToListAsync();
    }

    public async Task<List<DailyEntityAnalytics>> GetDailyHostAnalyticsAsync(int? hostId = null)
    {
        var sql = @"
            SELECT 
                ReadDate,
                Host_ID as EntityId,
                HostName as EntityName,
                TotalReads,
                ReadCount,
                UpdateCount as UpdateCount,
                CreateCount,
                DeleteCount
            FROM v_DailyHostReads";

        if (hostId.HasValue)
        {
            sql += " WHERE Host_ID = @hostId";
            return await _dbContext.Set<DailyEntityAnalytics>()
                .FromSqlRaw(sql + " ORDER BY ReadDate DESC", 
                    new Microsoft.Data.Sqlite.SqliteParameter("@hostId", hostId.Value))
                .ToListAsync();
        }

        return await _dbContext.Set<DailyEntityAnalytics>()
            .FromSqlRaw(sql + " ORDER BY ReadDate DESC")
            .ToListAsync();
    }

    public async Task<List<DailyEntityAnalytics>> GetDailyRemoteAnalyticsAsync(int? remoteId = null)
    {
        var sql = @"
            SELECT 
                ReadDate,
                Remote_ID as EntityId,
                RemoteName as EntityName,
                TotalReads,
                ReadCount,
                UpdateCount,
                CreateCount,
                DeleteCount
            FROM v_DailyRemoteReads";

        if (remoteId.HasValue)
        {
            sql += " WHERE Remote_ID = @remoteId";
            return await _dbContext.Set<DailyEntityAnalytics>()
                .FromSqlRaw(sql + " ORDER BY ReadDate DESC", 
                    new Microsoft.Data.Sqlite.SqliteParameter("@remoteId", remoteId.Value))
                .ToListAsync();
        }

        return await _dbContext.Set<DailyEntityAnalytics>()
            .FromSqlRaw(sql + " ORDER BY ReadDate DESC")
            .ToListAsync();
    }

    public async Task<EntityAnalytics> GetHostAnalyticsByIdAsync(int hostId)
    {
        return await _dbContext.Set<EntityAnalytics>()
            .FromSqlRaw(@"
                SELECT 
                    Host_ID as EntityId,
                    HostName as EntityName,
                    TotalReads,
                    TotalUpdates,
                    TotalCreates,
                    TotalDeletes,
                    Last30DaysActions
                FROM v_HostReadAnalytics
                WHERE Host_ID = @hostId",
                new Microsoft.Data.Sqlite.SqliteParameter("@hostId", hostId))
            .FirstOrDefaultAsync();
    }

    public async Task<EntityAnalytics> GetRemoteAnalyticsByIdAsync(int remoteId)
    {
        return await _dbContext.Set<EntityAnalytics>()
            .FromSqlRaw(@"
                SELECT 
                    Remote_ID as EntityId,
                    RemoteName as EntityName,
                    TotalReads,
                    TotalUpdates,
                    TotalCreates,
                    TotalDeletes,
                    Last30DaysActions
                FROM v_RemoteReadAnalytics
                WHERE Remote_ID = @remoteId",
                new Microsoft.Data.Sqlite.SqliteParameter("@remoteId", remoteId))
            .FirstOrDefaultAsync();
    }

    public async Task<DailyEntityAnalytics?> GetHostAnalyticsByIdAsync(string hostId)
    {
        var result = await _dbContext.Set<DailyEntityAnalytics>()
            .FromSqlRaw("SELECT * FROM HostAnalytics_Daily WHERE EntityId = @hostId",
                new SqliteParameter("@hostId", int.Parse(hostId)))
            .FirstOrDefaultAsync();

        return result ?? new DailyEntityAnalytics
        {
            EntityId = int.Parse(hostId),
            EntityName = "Unknown",
            ReadCount = 0,
            UpdateCount = 0,
            CreateCount = 0,
            DeleteCount = 0,
            TotalReads = 0,
            ReadDate = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };
    }

    public async Task<DailyEntityAnalytics?> GetRemoteAnalyticsByIdAsync(string remoteId)
    {
        var result = await _dbContext.Set<DailyEntityAnalytics>()
            .FromSqlRaw("SELECT * FROM RemoteAnalytics_Daily WHERE EntityId = @remoteId",
                new SqliteParameter("@remoteId", int.Parse(remoteId)))
            .FirstOrDefaultAsync();

        return result ?? new DailyEntityAnalytics
        {
            EntityId = int.Parse(remoteId),
            EntityName = "Unknown",
            ReadCount = 0,
            UpdateCount = 0,
            CreateCount = 0,
            DeleteCount = 0,
            TotalReads = 0,
            ReadDate = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };
    }

    public async Task<RecentRemoteAnalytics> GetRecentRemoteAnalyticsAsync()
    {
        var now = DateTimeOffset.UtcNow;
        var last24Hours = now.AddHours(-24).ToUnixTimeMilliseconds();
        var last30Days = now.AddDays(-30).ToUnixTimeMilliseconds();

        var sql = @"
            SELECT 
                (SELECT COUNT(*) 
                 FROM AuditReads_Remote 
                 WHERE Created_Date >= @last24Hours AND Action = 'Read') as Last24HoursCount,
                (SELECT COUNT(*) 
                 FROM AuditReads_Remote 
                 WHERE Created_Date >= @last30Days AND Action = 'Read') as Last30DaysCount,
                 '" + now + @"' AS QueryTime";

        var result = await _dbContext.Set<RecentRemoteAnalytics>()
            .FromSqlRaw(sql, 
                new SqliteParameter("@last24Hours", last24Hours.ToString()),
                new SqliteParameter("@last30Days", last30Days.ToString()))
            .FirstOrDefaultAsync();

        return result ?? new RecentRemoteAnalytics
        {
            Last24HoursCount = 0,
            Last30DaysCount = 0,
            QueryTime = now
        };
    }

    public async Task<RelationshipsModel?> GetRelationships()
    {
        var relationships = new RelationshipsModel();
        var hosts = await _dbContext.Hosts.ToListAsync();
        var remotes = await _dbContext.Remotes.ToListAsync();
        var hostRemotes = await _dbContext.Set<Host_Remote>().ToListAsync();

        // Process hosts
        foreach (var host in hosts)
        {
            var connectedRemotes = hostRemotes
                .Where(hr => hr.Host_ID == host.Host_ID)
                .Select(hr => hr.Remote_ID)
                .ToList();

            relationships.Hosts.Add(new HostRelationship
            {
                HostId = host.Host_ID.ToString(),
                Name = host.Name,
                Environment = host.Environment,
                ConnectedRemoteIds = connectedRemotes.Select(id => id.ToString()).ToList()
            });
        }

        // Process remotes
        foreach (var remote in remotes)
        {
            var connectedHosts = hostRemotes
                .Where(hr => hr.Remote_ID == remote.Remote_ID)
                .Select(hr => hr.Host_ID.ToString())
                .ToList();

            relationships.Remotes.Add(new RemoteRelationship
            {
                RemoteId = remote.Remote_ID.ToString(),
                Name = remote.Name,
                Key = remote.Key,
                ConnectedHostIds = connectedHosts
            });
        }

        return relationships;
    }
}
