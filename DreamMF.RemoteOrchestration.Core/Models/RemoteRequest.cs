namespace DreamMF.RemoteOrchestration.Core.Models;

public class RemoteRequest
{
    public string Name { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string[] Modules { get; set; } = Array.Empty<string>();
}
