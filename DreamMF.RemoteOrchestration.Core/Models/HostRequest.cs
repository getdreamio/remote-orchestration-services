namespace DreamMF.RemoteOrchestration.Core.Models;

public class HostRequest
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
