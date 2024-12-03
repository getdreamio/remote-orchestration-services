namespace DreamMF.RemoteOrchestration.Core.Models;

public class HostRequest
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public DateTime Created_Date { get; set; }
    public DateTime Updated_Date { get; set; }
}
