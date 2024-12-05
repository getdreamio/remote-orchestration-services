using System.ComponentModel.DataAnnotations;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Remote
{
    [Key]
    public int Remote_ID { get; set; }
    public string Name { get; set; } = string.Empty;
    public string StorageType { get; set; } = string.Empty; // e.g., AzureBlob, AWSS3
    public string Configuration { get; set; } = string.Empty;
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
