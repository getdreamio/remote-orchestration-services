namespace DreamMF.RemoteOrchestration.Core.Models;

public class DreamHostResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}
