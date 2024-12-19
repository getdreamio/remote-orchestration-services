namespace DreamMF.RemoteOrchestration.Core.Configuration;

public class AnalyticsConfig
{
    public bool EnableCleanupService { get; set; }
    public int CleanupIntervalHours { get; set; }
    public int RetentionDays { get; set; }
}
