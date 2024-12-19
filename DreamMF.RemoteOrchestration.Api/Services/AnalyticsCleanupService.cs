using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Core.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DreamMF.RemoteOrchestration.Api.Services;

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
            _logger.LogInformation("Analytics cleanup service is disabled via configuration");
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Starting analytics cleanup task");

                using (var scope = _scopeFactory.CreateScope())
                {
                    var analyticsService = scope.ServiceProvider.GetRequiredService<IAnalyticsService>();
                    await analyticsService.CleanupOldRecordsAsync();
                }

                _logger.LogInformation("Completed analytics cleanup task");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while running analytics cleanup task");
            }

            await Task.Delay(TimeSpan.FromHours(_config.CleanupIntervalHours), stoppingToken);
        }
    }
}
