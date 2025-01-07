using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Models;

public class RelationshipsModel
{
    public List<HostRelationship> Hosts { get; set; } = new();
    public List<RemoteRelationship> Remotes { get; set; } = new();
}

public class HostRelationship
{
    public string HostId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Environment { get; set; }
    public List<string> ConnectedRemoteIds { get; set; } = new();
}

public class RemoteRelationship
{
    public string RemoteId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Key { get; set; }
    public List<string> ConnectedHostIds { get; set; } = new();
}
