using System.ComponentModel.DataAnnotations;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Host_Remote
{
    [Key]
    public int Host_Remote_ID { get; set; }
    public int Host_ID { get; set; }
    public int Remote_ID { get; set; }
    public int Version_ID { get; set; }
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
