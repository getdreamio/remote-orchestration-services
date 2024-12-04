namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Tags_Remote
{
    public int Tag_Remote_ID { get; set; }
    public int Remote_ID { get; set; }
    public int Tag_ID { get; set; }
    public Tag Tag { get; set; } = null!;
}
