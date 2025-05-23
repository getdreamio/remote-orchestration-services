using System.Collections.Generic;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class AnalyticsSummary
{
    public List<EntityAnalytics> TopHosts { get; set; }
    public List<EntityAnalytics> TopRemotes { get; set; }
    public List<DailyEntityAnalytics> RecentHostActivity { get; set; }
    public List<DailyEntityAnalytics> RecentRemoteActivity { get; set; }
}
