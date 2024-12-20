namespace DreamMF.RemoteOrchestration.Core.Models;

public class TagRequest
{
    public int? Tag_ID {get; set;}
    public required string Key { get; set; }
    public required string Display_Name { get; set; }
}
