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
            Url = request.Url,
            Key = request.Key,
            Environment = request.Environment,
            Created_Date = request.Created_Date,
            Updated_Date = request.Updated_Date
        };
    }

    public static HostResponse ToResponse(this Host entity)
    {
        return new HostResponse
        {
            Id = entity.Host_ID,
            Name = entity.Name,
            Url = entity.Url,
            Key = entity.Key,
            Environment = entity.Environment,
            Created_Date = entity.Created_Date,
            Updated_Date = entity.Updated_Date
        };
    }
}
