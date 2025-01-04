using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class TagMapper
{
    public static Tag ToEntity(this TagRequest request)
    {
        return new Tag
        {
            Key = request.Key,
            Display_Name = request.Display_Name,
            Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };
    }

    public static TagResponse ToResponse(this Tag entity)
    {
        return new TagResponse
        {
            Tag_ID = entity.Tag_ID,
            Key = entity.Key,
            Display_Name = entity.Display_Name,
            Created_Date = DateTimeOffset.FromUnixTimeMilliseconds(entity.Created_Date),
            Updated_Date = DateTimeOffset.FromUnixTimeMilliseconds(entity.Updated_Date)
        };
    }

    public static TagEntityResponse ToResponse(this Tags_Host entity)
    {
        return new TagEntityResponse
        {
            Tag_ID = entity.Tag_ID,
            Key = entity.Tag.Key,
            Display_Name = entity.Tag.Display_Name,
            Value = entity.Value
        };
    }

    public static TagEntityResponse ToResponse(this Tags_Remote entity)
    {
        return new TagEntityResponse
        {
            Tag_ID = entity.Tag_ID,
            Key = entity.Tag.Key,
            Display_Name = entity.Tag.Display_Name,
            Value = entity.Value
        };
    }
}
