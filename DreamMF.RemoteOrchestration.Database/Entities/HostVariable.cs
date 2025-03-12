using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class HostVariable
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int HostVariable_ID { get; set; }
    
    public int Host_ID { get; set; }
    
    [Required]
    public string Key { get; set; } = string.Empty;
    
    public string Value { get; set; } = string.Empty;
    
    public long Created_Date { get; set; }
    
    public long Updated_Date { get; set; }
    
    [ForeignKey("Host_ID")]
    public virtual Host Host { get; set; } = null!;
}
