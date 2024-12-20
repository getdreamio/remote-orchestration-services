using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Tags_Remote
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Tag_Remote_ID { get; set; }
    
    public int Tag_ID { get; set; }
    [ForeignKey(nameof(Tag_ID))]
    public Tag Tag { get; set; } = null!;
    
    public int Remote_ID { get; set; }
    [ForeignKey("Remote_ID")]
    public Remote? Remote { get; set; }
    
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
