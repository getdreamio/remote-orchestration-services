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
    public string Key { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty; // e.g., AzureBlob, AWSS3
    public string? Repository { get; set; }
    public string? Contact_Name { get; set; }
    public string? Contact_Email { get; set; }
    public string? Documentation_Url { get; set; }
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }

    public ICollection<RemoteModule> RemoteModules { get; set; } = new List<RemoteModule>();
}
