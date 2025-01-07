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
    public string Url { get; set; } = string.Empty;
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}
