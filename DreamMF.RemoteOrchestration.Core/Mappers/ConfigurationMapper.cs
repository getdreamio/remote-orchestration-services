using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class ConfigurationMapper
{
    public static Database.Entities.Configuration ToEntity(this ConfigurationRequest request)
    {
        return new Database.Entities.Configuration
        {
            Key = request.Key,
            Value = request.Value
        };
    }

    public static ConfigurationResponse ToResponse(this Database.Entities.Configuration entity)
    {
        return new ConfigurationResponse
        {
            Id = entity.Configuration_ID,
            Key = entity.Key,
            Value = entity.Value,
            Created_Date = entity.Created_Date,
            Updated_Date = entity.Updated_Date
        };
    }
}
