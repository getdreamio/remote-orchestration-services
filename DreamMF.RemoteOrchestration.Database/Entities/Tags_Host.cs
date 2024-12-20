using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Tags_Host
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Tag_Host_ID { get; set; }
    
    public int Tag_ID { get; set; }

    [ForeignKey(nameof(Tag_ID))]
    public Tag? Tag { get; set; }

    public int Host_ID { get; set; }

    [ForeignKey(nameof(Host_ID))]
    public Host? Host { get; set; }

    public DateTimeOffset Created_Date { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset Updated_Date { get; set; } = DateTimeOffset.UtcNow;
}
