using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class HostRemoteMapper
{
    public static HostRemoteResponse ToResponse(this Host_Remote hostRemote)
    {
        return new HostRemoteResponse
        {
            Id = hostRemote.Host_Remote_ID,
            HostId = hostRemote.Host_ID,
            RemoteId = hostRemote.Remote_ID,
            UrlOverride = hostRemote.UrlOverride,
            CreatedDate = hostRemote.Created_Date,
            UpdatedDate = hostRemote.Updated_Date
        };
    }
}
