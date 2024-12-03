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
        app.MapGet("/remotes", async (RemoteService remoteService) =>
        {
            var remotes = await remoteService.GetAllRemotesAsync();
            return Results.Ok(remotes);
        })
        .WithTags(GroupName)
        .Produces<List<RemoteResponse>>(StatusCodes.Status200OK)
        .WithMetadata(new EndpointNameMetadata("List all remotes"));

        app.MapGet("/remotes/{id}", async (int id, RemoteService remoteService) =>
        {
            var remote = await remoteService.GetRemoteByIdAsync(id);
            return remote != null ? Results.Ok(remote) : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces<RemoteResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .WithMetadata(new EndpointNameMetadata("Get remote by ID"));

        app.MapPost("/remotes", async (RemoteRequest request, RemoteService remoteService) =>
        {
            var remote = await remoteService.CreateRemoteAsync(request);
            return Results.Created($"/remotes/{remote.Id}", remote);
        })
        .WithTags(GroupName)
        .Produces<RemoteResponse>(StatusCodes.Status201Created)
        .WithMetadata(new EndpointNameMetadata("Create a new remote"));

        app.MapPut("/remotes/{id}", async (int id, RemoteRequest request, RemoteService remoteService) =>
        {
            var success = await remoteService.UpdateRemoteAsync(id, request);
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .WithMetadata(new EndpointNameMetadata("Update a remote"));

        app.MapDelete("/remotes/{id}", async (int id, RemoteService remoteService) =>
        {
            var success = await remoteService.DeleteRemoteAsync(id);
            return success ? Results.Ok() : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .WithMetadata(new EndpointNameMetadata("Delete a remote by ID"));
    }
}
