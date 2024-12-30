namespace DreamMF.RemoteOrchestration.Core.Models;

public class HostRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public string Repository { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string DocumentationUrl { get; set; } = string.Empty;
    public long Created_Date { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    public long Updated_Date { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
}
