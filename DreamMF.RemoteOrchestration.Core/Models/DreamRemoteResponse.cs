namespace DreamMF.RemoteOrchestration.Core.Models;

public class DreamRemoteResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public List<ModuleResponse> Modules { get; set; } = new List<ModuleResponse>();
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}