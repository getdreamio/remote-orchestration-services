using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Collections.Generic;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Host
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Host_ID { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public string? Repository { get; set; }
    public string? Contact_Name { get; set; }
    public string? Contact_Email { get; set; }
    public string? Documentation_Url { get; set; }
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }

    public virtual ICollection<Tags_Host> Tags_Hosts { get; set; } = new List<Tags_Host>();
    public virtual ICollection<Host_Remote> Host_Remotes { get; set; } = new List<Host_Remote>();

    public static string GenerateKey()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 48)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}
