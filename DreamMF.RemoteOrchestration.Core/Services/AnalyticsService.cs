using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using DreamMF.RemoteOrchestration.Core.Configuration;
using DreamMF.RemoteOrchestration.Core.Models.Analytics;
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
            Created_Date = DateTimeOffset.UtcNow
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
            Created_Date = DateTimeOffset.UtcNow
        };

        _dbContext.AuditReads_Remotes.Add(audit);
        await _dbContext.SaveChangesAsync();
    }

    public async Task CleanupOldRecordsAsync()
    {
        try
        {
            var cutoffDate = DateTimeOffset.UtcNow.AddDays(-_config.RetentionDays);

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
            GetByIdCount = 0,
            UpdateCount = 0,
            CreateCount = 0,
            DeleteCount = 0,
            TotalReads = 0,
            ReadDate = DateTimeOffset.UtcNow
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
            GetByIdCount = 0,
            UpdateCount = 0,
            CreateCount = 0,
            DeleteCount = 0,
            TotalReads = 0,
            ReadDate = DateTimeOffset.UtcNow
        };
    }
}
