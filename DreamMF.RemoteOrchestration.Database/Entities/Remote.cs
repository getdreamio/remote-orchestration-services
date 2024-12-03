namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Remote
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string StorageType { get; set; } = string.Empty; // e.g., AzureBlob, AWSS3
    public string Configuration { get; set; } = string.Empty;
}
