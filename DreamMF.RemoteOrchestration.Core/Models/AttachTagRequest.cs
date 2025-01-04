namespace DreamMF.RemoteOrchestration.Core.Models;

public class AttachTagRequest
{
    public required string EntityType { get; set; }
    public required int EntityId { get; set; }
    public required int TagId { get; set; }
    public required string Value { get; set; }
}
