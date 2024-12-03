using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class RemoteMapper
{
    public static Remote ToEntity(this RemoteRequest request)
    {
        return new Remote
        {
            Name = request.Name,
            StorageType = request.StorageType,
            Configuration = request.Configuration
        };
    }

    public static RemoteResponse ToResponse(this Remote entity)
    {
        return new RemoteResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            StorageType = entity.StorageType,
            Configuration = entity.Configuration
        };
    }
}
