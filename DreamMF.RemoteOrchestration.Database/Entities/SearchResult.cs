using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Database.Entities;

[Keyless]
public class SearchResult
{
    public int EntityId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? Scope { get; set; }
    public string? Description { get; set; }
    public string? Environment { get; set; }
    public string? EntityKey { get; set; }
}
