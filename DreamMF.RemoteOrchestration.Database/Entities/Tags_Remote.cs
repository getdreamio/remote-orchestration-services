using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Tags_Remote
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Tag_Remote_ID { get; set; }
    
    public string Value { get; set; } = string.Empty;

    public int Tag_ID { get; set; }

    [ForeignKey(nameof(Tag_ID))]
    public virtual Tag? Tag { get; set; }
    
    public int Remote_ID { get; set; }

    [ForeignKey("Remote_ID")]
    public virtual Remote? Remote { get; set; }
    
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}
