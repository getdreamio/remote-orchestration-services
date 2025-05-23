using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

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
        group.RequireAuthorization();

        group.MapGet("/", GetAllRemotes)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<List<RemoteResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List all remotes"))
            .WithSummary("Get All Remotes")
            .WithDescription("Retrieves a list of all registered remote instances");

        group.MapGet("/modules", GetAllRemoteModules)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<List<ModuleResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List all modules that have previously been created"))
            .WithSummary("Get All Remote Modules")
            .WithDescription("Retrieves a list of all registered remote modules");

        group.MapGet("/{id}", GetRemoteById)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<RemoteResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get remote by ID"))
            .WithSummary("Get Remote by ID")
            .WithDescription("Retrieves a specific remote instance by its unique identifier");

        group.MapGet("/{id}/versions", GetVersionsByRemoteId)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<List<VersionResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get versions for a remote"))
            .WithSummary("Get Remote Versions")
            .WithDescription("Retrieves all versions with their URLs for a specific remote instance");

        group.MapPost("/", CreateRemote)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditRemotes" })
            .WithTags(GroupName)
            .Produces<RemoteResponse>(StatusCodes.Status201Created)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Create a new remote"))
            .WithSummary("Create a New Remote")
            .WithDescription("Creates a new remote instance with the provided details");

        group.MapPut("/{id}", UpdateRemote)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditRemotes" })
            .WithTags(GroupName)
            .Produces<RemoteResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Update an existing remote"))
            .WithSummary("Update Remote")
            .WithDescription("Updates an existing remote instance with the provided details");

        group.MapDelete("/{id}", DeleteRemote)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditRemotes" })
            .WithTags(GroupName)
            .Produces(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Delete a remote"))
            .WithSummary("Delete Remote")
            .WithDescription("Deletes a remote instance by its unique identifier");
            
        group.MapPut("/{id}/set-current-version", SetCurrentVersion)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditRemotes" })
            .WithTags(GroupName)
            .Produces<RemoteResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Set current version for a remote"))
            .WithSummary("Set Current Version")
            .WithDescription("Sets the specified version as the current version for a remote");

        return group;
    }

    private static async Task<IResult> GetAllRemoteModules(RemoteService remoteService, int? maxResults = null, string? contains = null)
    {
        var modules = await remoteService.GetAllRemoteModulesAsync(maxResults, contains);
        return Results.Ok(modules);
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
        var remote = await remoteService.UpdateRemoteAsync(id, request);
        return Results.Ok(remote);
    }

    private static async Task<IResult> DeleteRemote(int id, RemoteService remoteService)
    {
        var success = await remoteService.DeleteRemoteAsync(id);
        return success ? Results.Ok() : Results.NotFound();
    }

    private static async Task<IResult> GetVersionsByRemoteId(int id, RemoteService remoteService)
    {
        var result = await remoteService.GetVersionsByRemoteIdAsync(id);
        return result != null ? Results.Ok(result) : Results.NotFound();
    }
    
    private static async Task<IResult> SetCurrentVersion(int id, [FromBody] SetCurrentVersionRequest request, RemoteService remoteService)
    {
        if (request == null || string.IsNullOrEmpty(request.Version))
            return Results.BadRequest(new HandledResponseModel("Version is required", System.Net.HttpStatusCode.BadRequest));
            
        var remote = await remoteService.SetCurrentVersionAsync(id, request.Version);
        return remote != null ? Results.Ok(remote) : Results.NotFound();
    }
}