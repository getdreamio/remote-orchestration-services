using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;

namespace DreamMF.RemoteOrchestration.Api.Routes;

/// <summary>
/// Provides route configuration for tag-related endpoints
/// </summary>
public static class TagRoutes
{
    private const string GroupName = "Tags";

    /// <summary>
    /// Maps all tag-related routes for the application
    /// </summary>
    /// <param name="app">The web application to configure routes for</param>
    public static void MapTagRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/api/tags").WithTags(GroupName);
        group.MapTagsApi();
    }

    /// <summary>
    /// Configures the tag API endpoints for the route group
    /// </summary>
    /// <param name="group">The route group to configure</param>
    private static RouteGroupBuilder MapTagsApi(this RouteGroupBuilder group)
    {
        group.MapGet("", GetAllTags)
            .Produces<List<TagResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List all tags"))
            .WithSummary("Get All Tags")
            .WithDescription("Retrieves a list of all registered tags");

        group.MapGet("{id}", GetTagById)
            .Produces<TagResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get tag by ID"))
            .WithSummary("Get Tag by ID")
            .WithDescription("Retrieves a specific tag by its unique identifier");

        group.MapPost("", CreateTag)
            .Produces<TagResponse>(StatusCodes.Status201Created)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Create a new tag"))
            .WithSummary("Create a New Tag")
            .WithDescription("Creates a new tag with the provided information");

        group.MapPut("{id}", UpdateTag)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Update a tag"))
            .WithSummary("Update a Tag")
            .WithDescription("Updates an existing tag with the provided information");

        group.MapDelete("{id}", DeleteTag)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .WithMetadata(new EndpointNameMetadata("Delete a tag"))
            .WithSummary("Delete a Tag")
            .WithDescription("Deletes a tag by its unique identifier");

        group.MapPost("remote/{remoteId}/add/{tagId}", AddTagToRemote)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Add tag to remote"))
            .WithSummary("Add Tag to Remote")
            .WithDescription("Adds a tag to a remote entity");

        group.MapPost("host/{hostId}/add/{tagId}", AddTagToHost)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Add tag to host"))
            .WithSummary("Add Tag to Host")
            .WithDescription("Adds a tag to a host entity");

        group.MapGet("host/{hostId}", GetTagsByHostId)
            .Produces<List<TagResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get tags by host ID"))
            .WithSummary("Get Tags by Host ID")
            .WithDescription("Retrieves a list of tags associated with a host entity");

        group.MapDelete("host/{hostId}/remove/{tagId}", RemoveTagFromHost)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .WithMetadata(new EndpointNameMetadata("Remove tag from host"))
            .WithSummary("Remove Tag from Host")
            .WithDescription("Removes a tag from a host entity");

        group.MapGet("remote/{remoteId}", GetTagsByRemoteId)
            .Produces<List<TagResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get tags by remote ID"))
            .WithSummary("Get Tags by Remote ID")
            .WithDescription("Retrieves a list of tags associated with a remote entity");

        group.MapDelete("remote/{remoteId}/remove/{tagId}", RemoveTagFromRemote)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .WithMetadata(new EndpointNameMetadata("Remove tag from remote"))
            .WithSummary("Remove Tag from Remote")
            .WithDescription("Removes a tag from a remote entity");

        return group;
    }

    private static async Task<IResult> GetAllTags(TagService tagService)
    {
        var tags = await tagService.GetAllTagsAsync();
        return Results.Ok(tags);
    }

    private static async Task<IResult> GetTagById(int id, TagService tagService)
    {
        var tag = await tagService.GetTagByIdAsync(id);
        return tag != null ? Results.Ok(tag) : Results.NotFound();
    }

    private static async Task<IResult> CreateTag(TagRequest request, TagService tagService)
    {
        var tag = await tagService.CreateTagAsync(request);
        return Results.Created($"/api/tags/{tag.Tag_ID}", tag);
    }

    private static async Task<IResult> UpdateTag(int id, TagRequest request, TagService tagService)
    {
        var success = await tagService.UpdateTagAsync(id, request);
        return success ? Results.NoContent() : Results.NotFound();
    }

    private static async Task<IResult> DeleteTag(int id, TagService tagService)
    {
        var success = await tagService.DeleteTagAsync(id);
        return success ? Results.NoContent() : Results.NotFound();
    }

    private static async Task<IResult> AddTagToRemote(int remoteId, int tagId, TagService tagService)
    {
        var success = await tagService.AddTagToRemoteAsync(remoteId, tagId);
        return success ? Results.NoContent() : Results.BadRequest();
    }

    private static async Task<IResult> AddTagToHost(int hostId, int tagId, TagService tagService)
    {
        var success = await tagService.AddTagToHostAsync(hostId, tagId);
        return success ? Results.NoContent() : Results.BadRequest();
    }

    private static async Task<IResult> GetTagsByHostId(int hostId, TagService tagService)
    {
        var tags = await tagService.GetTagsByHostIdAsync(hostId);
        return tags != null ? Results.Ok(tags) : Results.NotFound();
    }

    private static async Task<IResult> RemoveTagFromHost(int hostId, int tagId, TagService tagService)
    {
        var success = await tagService.RemoveTagFromHostAsync(hostId, tagId);
        return success ? Results.NoContent() : Results.NotFound();
    }

    private static async Task<IResult> GetTagsByRemoteId(int remoteId, TagService tagService)
    {
        var tags = await tagService.GetTagsByRemoteIdAsync(remoteId);
        return tags != null ? Results.Ok(tags) : Results.NotFound();
    }

    private static async Task<IResult> RemoveTagFromRemote(int remoteId, int tagId, TagService tagService)
    {
        var success = await tagService.RemoveTagFromRemoteAsync(remoteId, tagId);
        return success ? Results.NoContent() : Results.NotFound();
    }
}