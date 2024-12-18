namespace DreamMF.RemoteOrchestration.Core.Models;

public class TagResponse
{
    public int Tag_ID { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
