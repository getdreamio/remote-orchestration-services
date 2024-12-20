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

    public static RemoteSummaryResponse ToSummaryResponse(this Remote entity)
    {
        return new RemoteSummaryResponse
        {
            Id = entity.Remote_ID,
            Name = entity.Name,
            Scope = entity.Scope,
            Key = entity.Key,
            Created_Date = entity.Created_Date,
            Updated_Date = entity.Updated_Date,
            Modules = entity.RemoteModules
                .Select(rm => new ModuleResponse
                {
                    Id = rm.Module.Module_ID,
                    Name = rm.Module.Name,
                    Created_Date = rm.Module.Created_Date,
                    Updated_Date = rm.Module.Updated_Date
                })
                .ToList()
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
            Modules = entity.RemoteModules
                .Select(rm => new ModuleResponse
                {
                    Id = rm.Module.Module_ID,
                    Name = rm.Module.Name,
                    Created_Date = rm.Module.Created_Date,
                    Updated_Date = rm.Module.Updated_Date
                })
                .ToList()
        };
    }
}
