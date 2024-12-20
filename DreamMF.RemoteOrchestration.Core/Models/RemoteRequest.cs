namespace DreamMF.RemoteOrchestration.Core.Models;

public class RemoteRequest
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;

    public string Scope { get; set; } = string.Empty;
    public string Repository { get; set; } = string.Empty;
    public string Contact_Name { get; set; } = string.Empty;
    public string Contact_Email { get; set; } = string.Empty;
    public string Documentation_Url { get; set; } = string.Empty;
    public IEnumerable<ModuleResponse> Modules { get; set; } = [];
}
