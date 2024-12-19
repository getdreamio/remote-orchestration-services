using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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
    private readonly DateTimeOffset _currentTime = DateTimeOffset.Parse("2024-12-19T09:39:33-07:00");

    public AnalyticsService(IRemoteOrchestrationDbContext dbContext, ILogger<AnalyticsService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task LogHostReadAsync(int hostId, string action, int userId)
    {
        var audit = new AuditReads_Host
        {
            Host_ID = hostId,
            Action = action,
            User_ID = userId,
            Created_Date = _currentTime
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
            Created_Date = _currentTime
        };

        _dbContext.AuditReads_Remotes.Add(audit);
        await _dbContext.SaveChangesAsync();
    }

    public async Task CleanupOldRecordsAsync()
    {
        try
        {
            var cutoffDate = _currentTime.AddDays(-30);

            // Delete old host read records
            await _dbContext.Set<AuditReads_Host>()
                .Where(a => a.Created_Date < cutoffDate)
                .ExecuteDeleteAsync();

            // Delete old remote read records
            await _dbContext.Set<AuditReads_Remote>()
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
