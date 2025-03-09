using System;

namespace DreamMF.RemoteOrchestration.Core.Models;

public class HostRemoteResponse
{
    public int Id { get; set; }
    public int HostId { get; set; }
    public int RemoteId { get; set; }
    public long CreatedDate { get; set; }
    public long UpdatedDate { get; set; }
}
