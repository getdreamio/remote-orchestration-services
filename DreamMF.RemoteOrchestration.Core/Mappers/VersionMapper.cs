using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class VersionMapper
{
    public static VersionResponse ToResponse(Database.Entities.Version version)
    {
        return new VersionResponse
        {
            Version_ID = version.Version_ID,
            Remote_ID = version.Remote_ID,
            Value = version.Value,
            Created_Date = version.Created_Date,
            Updated_Date = version.Updated_Date
        };
    }
}
