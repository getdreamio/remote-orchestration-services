namespace DreamMF.RemoteOrchestration.Database.Entities;

public class AuditRemote
{
    public int Audit_ID { get; set; }
    public int Remote_ID { get; set; }
    public string Change { get; set; } = string.Empty;
    public int Change_User_ID { get; set; }
    public long Created_Date { get; set; }
    
    public Remote? Remote { get; set; }
}
