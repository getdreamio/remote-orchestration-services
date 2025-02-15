using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class HostRoutes
{
    private const string GroupName = "Hosts";

    public static void MapHostRoutes(this WebApplication app)
    {
        app.MapGroup("/api/hosts").
            MapHostsApi();
    }

    private static RouteGroupBuilder MapHostsApi(this RouteGroupBuilder group)
    {
        group.RequireAuthorization();

        group.MapGet("/", GetHosts)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<List<HostResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List all hosts"))
            .WithSummary("Get All Hosts")
            .WithDescription("Retrieves a list of all registered host instances");

        group.MapGet("/{id}", GetHost)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<HostResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get host by ID"))
            .WithSummary("Get Host by ID")
            .WithDescription("Retrieves a specific host instance by its unique identifier");

        group.MapPost("/", CreateHost)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditHosts" })
            .WithTags(GroupName)
            .Produces<HostResponse>(StatusCodes.Status201Created)
            .WithMetadata(new EndpointNameMetadata("Create a new host"))
            .WithSummary("Create a New Host")
            .WithDescription("Creates a new host instance with the provided details");
        
        group.MapPut("/{id}", UpdateHost)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditHosts" })
            .WithTags(GroupName)
            .Produces<HostResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Update a host"))
            .WithSummary("Update a Host")
            .WithDescription("Updates an existing host instance with the provided details");

        group.MapDelete("/{id}", DeleteHost)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditHosts" })
            .WithTags(GroupName)
            .Produces(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Delete a host by ID"))
            .WithSummary("Delete a Host by ID")
            .WithDescription("Deletes a specific host instance by its unique identifier");

        group.MapGet("/{id}/remotes", GetRemotesByHostId)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<List<RemoteResponse>>(StatusCodes.Status200OK)
            .WithMetadata(new EndpointNameMetadata("List remotes by host ID"))
            .WithSummary("List Remotes by Host ID")
            .WithDescription("Retrieves a list of remotes associated with a specific host instance");

        group.MapPost("/{id}/attach", AttachRemoteToHost)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditHosts" })
            .WithTags(GroupName)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Attach remote to host"))
            .WithSummary("Attach Remote to Host")
            .WithDescription("Associates a remote instance with a specific host instance");

        group.MapPost("/{id}/detach", DetachRemoteFromHost)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditHosts" })
            .WithTags(GroupName)
            .Produces(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Detaches a remote from a host"))
            .WithSummary("Detaches a Remote from a Host")
            .WithDescription("Detaches a remote instance from a specific host instance");

        group.MapGet("/environment/{environment}", GetHostsByEnvironment)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<List<HostResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List hosts by environment"))
            .WithSummary("List Hosts by Environment")
            .WithDescription("Retrieves a list of host instances associated with a specific environment");

        return group;
    }

    private static async Task<IResult> GetHosts(HostService hostService)
    {
        var hosts = await hostService.GetAllHostsAsync();
        return Results.Ok(hosts);
    }

    private static async Task<IResult> GetHost(int id, HostService hostService)
    {
        var hosts = await hostService.GetHostByIdAsync(id);
        return Results.Ok(hosts);
    }

    private static async Task<IResult> CreateHost(HostRequest request, HostService hostService)
    {
        var host = await hostService.CreateHostAsync(request);
        return Results.Created($"/hosts/{host.Id}", host);
    }

    private static async Task<IResult> UpdateHost(int id, HostRequest request, HostService hostService)
    {
        var host = await hostService.UpdateHostAsync(id, request);
        return host != null ? Results.Ok(host) : Results.NotFound();
    }

    private static async Task<IResult> DeleteHost(int id, HostService hostService)
    {
        var success = await hostService.DeleteHostAsync(id);
        return success ? Results.Ok() : Results.NotFound();
    }

    private static async Task<IResult> GetRemotesByHostId(int id, HostService hostService)
    {
        var remotes = await hostService.GetRemotesByHostIdAsync(id);
        return Results.Ok(remotes);
    }

    private static async Task<IResult> AttachRemoteToHost(int id, AttachRemoteRequest request, HostService hostService)
    {
        var success = await hostService.AttachRemoteToHostAsync(id, request.RemoteId);
        return success ? Results.NoContent() : Results.BadRequest();
    }

    private static async Task<IResult> DetachRemoteFromHost(int id, AttachRemoteRequest request, HostService hostService)
    {
        var success = await hostService.DetachRemoteFromHostAsync(id, request.RemoteId);
        return success ? Results.NoContent() : Results.BadRequest();
    }

    private static async Task<IResult> GetHostsByEnvironment(string environment, HostService hostService)
    {
        var hosts = await hostService.GetHostsByEnvironmentAsync(environment);
        return Results.Ok(hosts);
    }
}