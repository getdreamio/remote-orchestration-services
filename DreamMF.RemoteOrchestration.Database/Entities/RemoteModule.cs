using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class RemoteModule
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Remote_Module_ID { get; set; }
    public int Remote_ID { get; set; }
    public int Module_ID { get; set; }
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }

    [ForeignKey("Remote_ID")]
    public Remote? Remote { get; set; }
    
    [ForeignKey("Module_ID")]
    public Module? Module { get; set; }
}
