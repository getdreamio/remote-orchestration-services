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
            Url = version.Url,
            IsCurrent = false, // Default to false when remote URL is not available
            Created_Date = version.Created_Date,
            Updated_Date = version.Updated_Date
        };
    }
    
    public static VersionResponse ToResponse(Database.Entities.Version version, string remoteUrl)
    {
        var isCurrent = !string.IsNullOrEmpty(version.Url) && !string.IsNullOrEmpty(remoteUrl) && remoteUrl.Contains($"/{version.Value}/");
        return new VersionResponse
        {
            Version_ID = version.Version_ID,
            Remote_ID = version.Remote_ID,
            Value = version.Value,
            Url = version.Url,
            IsCurrent = isCurrent,
            Created_Date = version.Created_Date,
            Updated_Date = version.Updated_Date
        };
    }
}
