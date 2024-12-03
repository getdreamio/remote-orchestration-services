namespace DreamMF.RemoteOrchestration.Database.Entities;

public class User
{
    public int User_ID { get; set; }
    public string Auth_Provider { get; set; } = string.Empty;
    public string Auth_User_ID { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime Created_Date { get; set; }
    public DateTime Updated_Date { get; set; }
}
