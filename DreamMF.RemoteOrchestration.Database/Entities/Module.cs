using System.ComponentModel.DataAnnotations;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Module
{
    [Key]
    public int Module_ID { get; set; }
    public string List { get; set; } = string.Empty;
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
