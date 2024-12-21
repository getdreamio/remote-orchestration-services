using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class RemoteMapper
{
    public static Remote ToEntity(this RemoteRequest request)
    {
        return new Remote
        {
            Name = request.Name,
            Scope = request.Scope,
            Key = request.Key,
            Created_Date = DateTimeOffset.UtcNow,
            Updated_Date = DateTimeOffset.UtcNow
        };
    }

    public static RemoteResponse ToResponse(this Remote entity)
    {
        return new RemoteResponse
        {
            Id = entity.Remote_ID,
            Name = entity.Name,
            Scope = entity.Scope,
            Key = entity.Key,
            Created_Date = entity.Created_Date,
            Updated_Date = entity.Updated_Date,
            Modules = entity.Modules
                .Select(module => new ModuleResponse
                {
                    Id = module.Module_ID,
                    Name = module.Name,
                    Created_Date = module.Created_Date,
                    Updated_Date = module.Updated_Date
                })
                .ToList()
        };
    }
}
