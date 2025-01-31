using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class ModuleMapper
{
    public static ModuleResponse ToResponse(this Module entity)
    {
        return new ModuleResponse
        {
            Id = entity.Module_ID,
            Name = entity.Name,
            Created_Date = entity.Created_Date,
            Updated_Date = entity.Updated_Date
        };
    }
}
