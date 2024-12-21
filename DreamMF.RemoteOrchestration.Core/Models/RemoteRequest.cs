namespace DreamMF.RemoteOrchestration.Core.Models;

public class RemoteRequest
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string Repository { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string DocumentationUrl { get; set; } = string.Empty;
    public IEnumerable<ModuleResponse> Modules { get; set; } = [];
}
