using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Tags_Host
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Tag_Host_ID { get; set; }
    public int Host_ID { get; set; }
    public int Tag_ID { get; set; }
    public Tag Tag { get; set; } = null!;
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
