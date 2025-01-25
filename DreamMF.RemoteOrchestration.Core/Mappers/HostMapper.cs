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
            Description = request.Description,
            Url = request.Url,
            Key = Host.GenerateKey(),
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
            Description = entity.Description,
            Url = entity.Url,
            Key = entity.Key,
            Environment = entity.Environment,
            RemoteCount = entity.Host_Remotes.Count,
            Created_Date = entity.Created_Date,
            Updated_Date = entity.Updated_Date
        };
    }

    public static DreamHostResponse ToDreamResponse(this Host entity)
    {
        return new DreamHostResponse
        {
            Id = entity.Host_ID,
            Name = entity.Name,
            Description = entity.Description,
            Url = entity.Url,
            Key = entity.Key,
            Environment = entity.Environment,
            Created_Date = entity.Created_Date,
            Updated_Date = entity.Updated_Date
        };
    }
}
