using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class TagMapper
{
    public static Tag ToEntity(this TagRequest request)
    {
        return new Tag
        {
            Text = request.Text
        };
    }

    public static TagResponse ToResponse(this Tag entity)
    {
        return new TagResponse
        {
            Tag_ID = entity.Tag_ID,
            Text = entity.Text,
            Created_Date = entity.Created_Date,
            Updated_Date = entity.Updated_Date
        };
    }
}
