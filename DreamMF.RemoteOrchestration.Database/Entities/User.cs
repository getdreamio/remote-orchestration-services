using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int User_ID { get; set; }
    public string Auth_Provider { get; set; } = string.Empty;
    public string Auth_User_ID { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}
