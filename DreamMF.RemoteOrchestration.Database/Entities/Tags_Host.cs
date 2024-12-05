using System.ComponentModel.DataAnnotations;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Tags_Host
{
    [Key]
    public int Tag_Host_ID { get; set; }
    public int Host_ID { get; set; }
    public int Tag_ID { get; set; }
    public Tag Tag { get; set; } = null!;
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
