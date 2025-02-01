namespace DreamMF.RemoteOrchestration.Core.Models;

public class HostResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public string Repository { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string DocumentationUrl { get; set; } = string.Empty;
    public int RemoteCount { get; set; } = 0;
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
    public string tag_Value { get; set; } = string.Empty;
}
