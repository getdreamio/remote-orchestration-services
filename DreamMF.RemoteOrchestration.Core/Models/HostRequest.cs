using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Models;

public class HostRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public IEnumerable<TagRequest> Tags {get; set;} = [];
    public DateTimeOffset Created_Date { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset Updated_Date { get; set; } = DateTimeOffset.UtcNow;
}
