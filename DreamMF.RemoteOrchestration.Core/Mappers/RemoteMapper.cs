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
            Repository = request.Repository,
            Contact_Name = request.ContactName,
            Contact_Email = request.ContactEmail,
            Documentation_Url = request.DocumentationUrl,
            Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
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
            Url = entity.Url,
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
            Url = entity.Url,
            Repository = entity.Repository,
            ContactName = entity.Contact_Name,
            ContactEmail = entity.Contact_Email,
            DocumentationUrl = entity.Documentation_Url,
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
