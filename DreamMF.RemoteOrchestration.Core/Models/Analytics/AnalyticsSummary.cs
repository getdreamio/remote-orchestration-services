using System.Collections.Generic;

namespace DreamMF.RemoteOrchestration.Core.Models.Analytics;

public class AnalyticsSummary
{
    public List<EntityAnalytics> TopHosts { get; set; }
    public List<EntityAnalytics> TopRemotes { get; set; }
    public List<DailyEntityAnalytics> RecentHostActivity { get; set; }
    public List<DailyEntityAnalytics> RecentRemoteActivity { get; set; }
}
