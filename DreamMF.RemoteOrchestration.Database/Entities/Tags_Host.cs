using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Tags_Host
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Tag_Host_ID { get; set; }
    
    public int Tag_ID { get; set; }
    public string Value { get; set; } = string.Empty;

    [ForeignKey(nameof(Tag_ID))]
    public virtual Tag? Tag { get; set; }

    public int Host_ID { get; set; }

    [ForeignKey(nameof(Host_ID))]
    public virtual Host? Host { get; set; }

    public long Created_Date { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    public long Updated_Date { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
}
