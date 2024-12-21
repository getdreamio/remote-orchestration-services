using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class RemoteModule
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Remote_Module_ID { get; set; }


    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }


    [ForeignKey(nameof(Remote))]
    public int Remote_ID { get; set; }
    [ForeignKey(nameof(Remote_ID))]
    public virtual Remote? Remote { get; set; }


    [ForeignKey(nameof(Module))]
    public int Module_ID { get; set; }
    [ForeignKey(nameof(Module_ID))]
    public virtual Module? Module { get; set; }
}
