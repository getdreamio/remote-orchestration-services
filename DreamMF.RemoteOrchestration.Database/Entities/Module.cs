using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Module
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Module_ID { get; set; }
    public string Name { get; set; } = string.Empty;
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}
