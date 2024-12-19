namespace DreamMF.RemoteOrchestration.Core.Models;

public class TagResponse
{
    public required int Tag_ID { get; set; }
    public required string Key { get; set; }
    public required string Display_Name { get; set; }
    public required DateTimeOffset Created_Date { get; set; }
    public required DateTimeOffset Updated_Date { get; set; }
}
