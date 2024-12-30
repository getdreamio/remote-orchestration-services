using System;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class EntityAnalytics
{
    public int EntityId { get; set; }
    public string EntityName { get; set; }
    public int TotalReads { get; set; }
    public int TotalUpdates { get; set; }
    public int TotalCreates { get; set; }
    public int TotalDeletes { get; set; }
    public int Last30DaysActions { get; set; }
}

public class DailyEntityAnalytics
{
    public long ReadDate { get; set; }
    public int EntityId { get; set; }
    public string EntityName { get; set; }
    public int TotalReads { get; set; }
    public int ReadCount { get; set; }
    public int UpdateCount { get; set; }
    public int CreateCount { get; set; }
    public int DeleteCount { get; set; }
}
