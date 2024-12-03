namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Version
{
    public int Version_ID { get; set; }
    public int Remote_ID { get; set; }
    public string Value { get; set; } = string.Empty;
    public DateTime Created_Date { get; set; }
}
