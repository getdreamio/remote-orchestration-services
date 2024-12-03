namespace DreamMF.RemoteOrchestration.Core.Models;

public class RemoteResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string StorageType { get; set; } = string.Empty;
    public string Configuration { get; set; } = string.Empty;
}
