using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class TagRoutes
{
    private const string GroupName = "Tags";

    public static void MapTagRoutes(this WebApplication app)
    {
        app.MapGet("/tags", async (TagService tagService) =>
        {
            var tags = await tagService.GetAllTagsAsync();
            return Results.Ok(tags);
        })
        .WithTags(GroupName)
        .Produces<List<TagResponse>>(StatusCodes.Status200OK)
        .Produces<HandledResponseModel>(400)
        .Produces<HandledResponseModel>(500)
        .WithMetadata(new EndpointNameMetadata("List all tags"));

        app.MapGet("/tags/{id}", async (int id, TagService tagService) =>
        {
            var tag = await tagService.GetTagByIdAsync(id);
            return tag != null ? Results.Ok(tag) : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces<TagResponse>(StatusCodes.Status200OK)
        .Produces<HandledResponseModel>(400)
        .Produces<HandledResponseModel>(500)
        .WithMetadata(new EndpointNameMetadata("Get tag by ID"));

        app.MapPost("/tags", async (TagRequest request, TagService tagService) =>
        {
            var tag = await tagService.CreateTagAsync(request);
            return Results.Created($"/tags/{tag.Tag_ID}", tag);
        })
        .WithTags(GroupName)
        .Produces<TagResponse>(StatusCodes.Status201Created)
        .Produces<HandledResponseModel>(400)
        .Produces<HandledResponseModel>(500)
        .WithMetadata(new EndpointNameMetadata("Create a new tag"));

        app.MapPut("/tags/{id}", async (int id, TagRequest request, TagService tagService) =>
        {
            var success = await tagService.UpdateTagAsync(id, request);
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status204NoContent)
        .Produces<HandledResponseModel>(400)
        .Produces<HandledResponseModel>(500)
        .WithMetadata(new EndpointNameMetadata("Update a tag"));

        app.MapDelete("/tags/{id}", async (int id, TagService tagService) =>
        {
            var success = await tagService.DeleteTagAsync(id);
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .WithMetadata(new EndpointNameMetadata("Delete a tag"));

        app.MapPost("/tags/remote/{remoteId}/add/{tagId}", async (int remoteId, int tagId, TagService tagService) =>
        {
            var success = await tagService.AddTagToRemoteAsync(remoteId, tagId);
            return success ? Results.NoContent() : Results.BadRequest();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status204NoContent)
        .Produces<HandledResponseModel>(400)
        .Produces<HandledResponseModel>(500)
        .WithMetadata(new EndpointNameMetadata("Add tag to remote"));

        app.MapPost("/tags/host/{hostId}/add/{tagId}", async (int hostId, int tagId, TagService tagService) =>
        {
            var success = await tagService.AddTagToHostAsync(hostId, tagId);
            return success ? Results.NoContent() : Results.BadRequest();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status204NoContent)
        .Produces<HandledResponseModel>(400)
        .Produces<HandledResponseModel>(500)
        .WithMetadata(new EndpointNameMetadata("Add tag to host"));

        app.MapGet("/tags/host/{hostId}", async (int hostId, TagService tagService) =>
        {
            var tags = await tagService.GetTagsByHostIdAsync(hostId);
            return tags != null ? Results.Ok(tags) : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces<List<TagResponse>>(StatusCodes.Status200OK)
        .Produces<HandledResponseModel>(400)
        .Produces<HandledResponseModel>(500)
        .WithMetadata(new EndpointNameMetadata("Get tags by host ID"));

        app.MapDelete("/tags/host/{hostId}/remove/{tagId}", async (int hostId, int tagId, TagService tagService) =>
        {
            var success = await tagService.RemoveTagFromHostAsync(hostId, tagId);
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .WithMetadata(new EndpointNameMetadata("Remove tag from host"));

        app.MapGet("/tags/remote/{remoteId}", async (int remoteId, TagService tagService) =>
        {
            var tags = await tagService.GetTagsByRemoteIdAsync(remoteId);
            return tags != null ? Results.Ok(tags) : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces<List<TagResponse>>(StatusCodes.Status200OK)
        .Produces<HandledResponseModel>(400)
        .Produces<HandledResponseModel>(500)
        .WithMetadata(new EndpointNameMetadata("Get tags by remote ID"));

        app.MapDelete("/tags/remote/{remoteId}/remove/{tagId}", async (int remoteId, int tagId, TagService tagService) =>
        {
            var success = await tagService.RemoveTagFromRemoteAsync(remoteId, tagId);
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .WithMetadata(new EndpointNameMetadata("Remove tag from remote"));
    }
}
