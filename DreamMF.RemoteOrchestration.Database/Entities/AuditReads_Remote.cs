using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class AuditReads_Remote
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int AuditRead_ID { get; set; }
    public int Remote_ID { get; set; }
    public string Action { get; set; } = string.Empty;
    public int User_ID { get; set; }
    public long Created_Date { get; set; }
}
