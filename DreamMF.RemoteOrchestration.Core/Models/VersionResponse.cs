using System;

namespace DreamMF.RemoteOrchestration.Core.Models;

public class VersionResponse
{
    public int Version_ID { get; set; }
    public int Remote_ID { get; set; }
    public string Value { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public bool IsCurrent { get; set; }
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}
