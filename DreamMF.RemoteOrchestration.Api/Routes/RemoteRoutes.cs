using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class RemoteRoutes
{
    private const string GroupName = "Remotes";

    public static void MapRemoteRoutes(this WebApplication app)
    {
        app.MapGroup("/api/remotes").MapRemotesApi();
    }

    private static RouteGroupBuilder MapRemotesApi(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetAllRemotes)
            .WithTags(GroupName)
            .Produces<List<RemoteResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List all remotes"))
            .WithSummary("Get All Remotes")
            .WithDescription("Retrieves a list of all registered remote instances");

        group.MapGet("/{id}", GetRemoteById)
            .WithTags(GroupName)
            .Produces<RemoteResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get remote by ID"))
            .WithSummary("Get Remote by ID")
            .WithDescription("Retrieves a specific remote instance by its unique identifier");

        group.MapPost("/", CreateRemote)
            .WithTags(GroupName)
            .Produces<RemoteResponse>(StatusCodes.Status201Created)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Create a new remote"))
            .WithSummary("Create a New Remote")
            .WithDescription("Creates a new remote instance with the provided details");

        group.MapPut("/{id}", UpdateRemote)
            .WithTags(GroupName)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Update a remote"))
            .WithSummary("Update a Remote")
            .WithDescription("Updates an existing remote instance with the provided details");

        group.MapDelete("/{id}", DeleteRemote)
            .WithTags(GroupName)
            .Produces(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Delete a remote by ID"))
            .WithSummary("Delete a Remote by ID")
            .WithDescription("Deletes a specific remote instance by its unique identifier");

        return group;
    }

    private static async Task<IResult> GetAllRemotes(RemoteService remoteService)
    {
        var remotes = await remoteService.GetAllRemotesAsync();
        return Results.Ok(remotes);
    }

    private static async Task<IResult> GetRemoteById(int id, RemoteService remoteService)
    {
        var remote = await remoteService.GetRemoteByIdAsync(id);
        return remote != null ? Results.Ok(remote) : Results.NotFound();
    }

    private static async Task<IResult> CreateRemote(RemoteRequest request, RemoteService remoteService)
    {
        var remote = await remoteService.CreateRemoteAsync(request);
        return Results.Created($"/api/remotes/{remote.Id}", remote);
    }

    private static async Task<IResult> UpdateRemote(int id, RemoteRequest request, RemoteService remoteService)
    {
        var success = await remoteService.UpdateRemoteAsync(id, request);
        return success ? Results.NoContent() : Results.NotFound();
    }

    private static async Task<IResult> DeleteRemote(int id, RemoteService remoteService)
    {
        var success = await remoteService.DeleteRemoteAsync(id);
        return success ? Results.Ok() : Results.NotFound();
    }
}