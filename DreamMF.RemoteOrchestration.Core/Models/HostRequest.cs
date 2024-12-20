namespace DreamMF.RemoteOrchestration.Core.Models;

public class HostRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public string Repository { get; set; } = string.Empty;
    public string Contact_Name { get; set; } = string.Empty;
    public string Contact_Email { get; set; } = string.Empty;
    public string Documentation_Url { get; set; } = string.Empty;
    public DateTimeOffset Created_Date { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset Updated_Date { get; set; } = DateTimeOffset.UtcNow;
}
