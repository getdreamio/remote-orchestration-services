using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Core.Models.Analytics;
using Microsoft.EntityFrameworkCore;
using DreamMF.RemoteOrchestration.Core.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class AnalyticsCleanupService : BackgroundService
{
    private readonly ILogger<AnalyticsCleanupService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly AnalyticsConfig _config;

    public AnalyticsCleanupService(
        ILogger<AnalyticsCleanupService> logger,
        IServiceScopeFactory scopeFactory,
        IOptions<AnalyticsConfig> config)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
        _config = config.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_config.EnableCleanupService)
        {
            _logger.LogInformation("Analytics cleanup service is disabled");
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupOldAnalyticsData();
                await Task.Delay(TimeSpan.FromHours(_config.CleanupIntervalHours), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while cleaning up analytics data");
                await Task.Delay(TimeSpan.FromMinutes(60), stoppingToken); // Wait 5 minutes before retrying on error
            }
        }
    }

    private async Task CleanupOldAnalyticsData()
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-_config.RetentionDays);
        _logger.LogInformation("Starting analytics cleanup for data older than {CutoffDate}", cutoffDate);

        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IRemoteOrchestrationDbContext>();

        // Delete old host audit reads
        var deletedHostReads = await dbContext.AuditReads_Hosts
            .Where(ar => ar.Created_Date < cutoffDate)
            .ExecuteDeleteAsync();

        // Delete old remote audit reads
        var deletedRemoteReads = await dbContext.AuditReads_Remotes
            .Where(ar => ar.Created_Date < cutoffDate)
            .ExecuteDeleteAsync();

        _logger.LogInformation(
            "Analytics cleanup completed. Deleted {HostReads} host reads and {RemoteReads} remote reads",
            deletedHostReads,
            deletedRemoteReads);
    }
}
