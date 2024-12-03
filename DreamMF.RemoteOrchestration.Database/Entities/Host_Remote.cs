namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Host_Remote
{
    public int Host_Remote_ID { get; set; }
    public int Host_ID { get; set; }
    public int Remote_ID { get; set; }
    public int Version_ID { get; set; }
    public DateTime Created_Date { get; set; }
    public DateTime Updated_Date { get; set; }
}
