using System;

namespace DreamMF.RemoteOrchestration.Core.Models;

public class VersionResponse
{
    public int Version_ID { get; set; }
    public int Remote_ID { get; set; }
    public string Value { get; set; } = string.Empty;
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
