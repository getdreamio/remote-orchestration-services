using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Tag
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Tag_ID { get; set; }
    public required string Key { get; set; }
    public string Display_Name { get; set; } = string.Empty;
    public DateTimeOffset Created_Date { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset Updated_Date { get; set; } = DateTimeOffset.UtcNow;
}
