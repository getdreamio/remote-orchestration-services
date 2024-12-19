using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using DreamMF.RemoteOrchestration.Core.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IAnalyticsService
{
    Task LogHostReadAsync(int hostId, string action, int userId);
    Task LogRemoteReadAsync(int remoteId, string action, int userId);
    Task CleanupOldRecordsAsync();
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
}
