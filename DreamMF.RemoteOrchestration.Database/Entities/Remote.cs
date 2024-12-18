using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Remote
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Remote_ID { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty; // e.g., AzureBlob, AWSS3
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }

    public ICollection<RemoteModule> RemoteModules { get; set; } = new List<RemoteModule>();
}
