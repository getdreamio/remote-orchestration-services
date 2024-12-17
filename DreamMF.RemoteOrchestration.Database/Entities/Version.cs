using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Version
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Version_ID { get; set; }
    public int Remote_ID { get; set; }
    public string Value { get; set; } = string.Empty;
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
