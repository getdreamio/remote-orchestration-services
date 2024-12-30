namespace DreamMF.RemoteOrchestration.Core.Models;

public class ConfigurationResponse
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}
