using System;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class RecentRemoteAnalytics
{
    public int Last24HoursCount { get; set; }
    public int Last30DaysCount { get; set; }
    public DateTimeOffset QueryTime { get; set; }
}
