namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Module
{
    public int Module_ID { get; set; }
    public string List { get; set; } = string.Empty;
    public DateTime Created_Date { get; set; }
    public DateTime Updated_Date { get; set; }
}
