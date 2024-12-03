namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Host
{
    public int Id { get; set; }
    public int Host_ID { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public DateTime Created_Date { get; set; }
    public DateTime Updated_Date { get; set; }
}
