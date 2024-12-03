using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class HostMapper
{
    public static Host ToEntity(this HostRequest request)
    {
        return new Host
        {
            Name = request.Name,
            Url = request.Url
        };
    }

    public static HostResponse ToResponse(this Host entity)
    {
        return new HostResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Url = entity.Url
        };
    }
}
