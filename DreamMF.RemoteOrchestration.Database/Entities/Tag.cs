using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Tag
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Tag_ID { get; set; }
    public required string Key { get; set; }
    public string Display_Name { get; set; } = string.Empty;
    public long Created_Date { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    public long Updated_Date { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    public virtual ICollection<Tags_Host> Tags_Hosts { get; set; } = new List<Tags_Host>();
    public virtual ICollection<Tags_Remote> Tags_Remotes { get; set; } = new List<Tags_Remote>();
}
