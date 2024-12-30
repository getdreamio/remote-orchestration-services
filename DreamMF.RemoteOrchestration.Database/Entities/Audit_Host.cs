using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Audit_Host
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Audit_ID { get; set; }
    public int Host_ID { get; set; }
    public string Change { get; set; } = string.Empty;
    public int Change_User_ID { get; set; }
    public long Created_Date { get; set; }
}
