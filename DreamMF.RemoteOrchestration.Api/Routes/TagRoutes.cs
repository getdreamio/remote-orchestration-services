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
        group.RequireAuthorization();

        group.MapGet("", GetAllTags)
            .RequireAuthorization()
            .Produces<List<TagResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List all tags"))
            .WithSummary("Get All Tags")
            .WithDescription("Retrieves a list of all registered tags");

        group.MapGet("{id}", GetTagById)
            .RequireAuthorization()
            .Produces<TagResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get tag by ID"))
            .WithSummary("Get Tag by ID")
            .WithDescription("Retrieves a specific tag by its unique identifier");

        group.MapPost("", CreateTag)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditTags" })
            .Produces<TagResponse>(StatusCodes.Status201Created)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Create a new tag"))
            .WithSummary("Create Tag")
            .WithDescription("Creates a new tag with the provided details");

        group.MapPut("{id}", UpdateTag)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditTags" })
            .Produces<TagResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Update an existing tag"))
            .WithSummary("Update Tag")
            .WithDescription("Updates an existing tag with the provided details");

        group.MapDelete("{id}", DeleteTag)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditTags" })
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Delete a tag"))
            .WithSummary("Delete Tag")
            .WithDescription("Deletes a tag by its unique identifier");

        group.MapGet("{id}/hosts", GetTagHosts)
            .RequireAuthorization()
            .Produces<List<HostResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get hosts using tag"))
            .WithSummary("Get Tag Hosts")
            .WithDescription("Retrieves all hosts that are using this tag");

        group.MapGet("{id}/remotes", GetTagRemotes)
            .RequireAuthorization()
            .Produces<List<RemoteResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get remotes using tag"))
            .WithSummary("Get Tag Remotes")
            .WithDescription("Retrieves all remotes that are using this tag");

        group.MapPost("/add-to-entity", AddTagToEntity)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditTags" })
            .Produces<TagEntityResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Add tag to Entity"))
            .WithSummary("Add Tag to Entity")
            .WithDescription("Adds a tag to a remote entity");

        group.MapGet("host/{hostId}", GetTagsByHostId)
            .RequireAuthorization()
            .Produces<List<TagResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get tags by host ID"))
            .WithSummary("Get Tags by Host ID")
            .WithDescription("Retrieves a list of tags associated with a host entity");

        group.MapDelete("host/{hostId}/remove/{tagId}", RemoveTagFromHost)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditTags" })
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .WithMetadata(new EndpointNameMetadata("Remove tag from host"))
            .WithSummary("Remove Tag from Host")
            .WithDescription("Removes a tag from a host entity");

        group.MapGet("remote/{remoteId}", GetTagsByRemoteId)
            .RequireAuthorization()
            .Produces<List<TagResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get tags by remote ID"))
            .WithSummary("Get Tags by Remote ID")
            .WithDescription("Retrieves a list of tags associated with a remote entity");

        group.MapDelete("remote/{remoteId}/remove/{tagId}", RemoveTagFromRemote)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditTags" })
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
        var tag = await tagService.UpdateTagAsync(id, request);
        return tag != null ? Results.Ok(tag) : Results.NotFound();
    }

    private static async Task<IResult> DeleteTag(int id, TagService tagService)
    {
        var success = await tagService.DeleteTagAsync(id);
        return success ? Results.NoContent() : Results.NotFound();
    }
    
    private static async Task<IResult> AddTagToEntity(AttachTagRequest model, TagService tagService)
    {
        if (model.EntityType == "host")
        {
            return await AddTagToHost(model.EntityId, model.TagId, model.Value, tagService);
        }
        else if (model.EntityType == "remote")
        {
            return await AddTagToRemote(model.EntityId, model.TagId, model.Value, tagService);
        }
        else
        {
            return Results.BadRequest();
        }
    }

    private static async Task<IResult> AddTagToRemote(int remoteId, int tagId, string value, TagService tagService)
    {
        var success = await tagService.AddTagToRemoteAsync(remoteId, tagId, value);
        return success != null ? Results.Ok(success) : Results.BadRequest();
    }

    private static async Task<IResult> AddTagToHost(int hostId, int tagId, string value, TagService tagService)
    {
        var success = await tagService.AddTagToHostAsync(hostId, tagId, value);
        return success != null ? Results.Ok(success) : Results.BadRequest();
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

    private static async Task<IResult> GetTagHosts(int id, TagService tagService)
    {
        var hosts = await tagService.GetTagHosts(id);
        return hosts != null ? Results.Ok(hosts) : Results.NotFound();
    }

    private static async Task<IResult> GetTagRemotes(int id, TagService tagService)
    {
        var remotes = await tagService.GetTagRemotes(id);
        return remotes != null ? Results.Ok(remotes) : Results.NotFound();
    }
}