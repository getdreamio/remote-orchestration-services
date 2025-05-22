using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Host_Remote
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Host_Remote_ID { get; set; }
    public int Host_ID { get; set; }
    public int Remote_ID { get; set; }

    [ForeignKey("Host_ID")]
    public virtual Host? Host { get; set; }

    [ForeignKey("Remote_ID")]
    public virtual Remote? Remote { get; set; }

    public string? UrlOverride { get; set; }

    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}
