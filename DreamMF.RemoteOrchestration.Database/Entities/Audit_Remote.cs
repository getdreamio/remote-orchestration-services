namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Audit_Remote
{
    public int Audit_ID { get; set; }
    public int Remote_ID { get; set; }
    public string Change { get; set; } = string.Empty;
    public int Change_User_ID { get; set; }
    public DateTime Created_Date { get; set; }
}
