using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class HostVariableMapper
{
    public static HostVariableResponse ToResponse(this HostVariable entity)
    {
        return new HostVariableResponse
        {
            Id = entity.HostVariable_ID,
            HostId = entity.Host_ID,
            Key = entity.Key,
            Value = entity.Value,
            CreatedDate = entity.Created_Date,
            UpdatedDate = entity.Updated_Date
        };
    }

    public static HostVariable ToEntity(HostVariableRequest request, int hostId)
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        
        return new HostVariable
        {
            Host_ID = hostId,
            Key = request.Key,
            Value = request.Value,
            Created_Date = now,
            Updated_Date = now
        };
    }
}
