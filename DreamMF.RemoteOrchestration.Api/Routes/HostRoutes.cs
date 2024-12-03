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

        app.MapGet("/hosts", async (HostService hostService) =>
        {
            var hosts = await hostService.GetAllHostsAsync();
            return Results.Ok(hosts);
        })
        .WithTags(GroupName)
        .Produces<List<HostResponse>>(StatusCodes.Status200OK)
        .WithMetadata(new EndpointNameMetadata("List all hosts"));

        app.MapGet("/hosts/{id}", async (int id, HostService hostService) =>
        {
            var host = await hostService.GetHostByIdAsync(id);
            return host != null ? Results.Ok(host) : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces<HostResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .WithMetadata(new EndpointNameMetadata("Get host by ID"));

        app.MapPost("/hosts", async (HostRequest request, HostService hostService) =>
        {
            var host = await hostService.CreateHostAsync(request);
            return Results.Created($"/hosts/{host.Id}", host);
        })
        .WithTags(GroupName)
        .Produces<HostResponse>(StatusCodes.Status201Created)
        .WithMetadata(new EndpointNameMetadata("Create a new host"));

        app.MapPut("/hosts/{id}", async (int id, HostRequest request, HostService hostService) =>
        {
            var success = await hostService.UpdateHostAsync(id, request);
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .WithMetadata(new EndpointNameMetadata("Update a host"));

        app.MapDelete("/hosts/{id}", async (int id, HostService hostService) =>
        {
            var success = await hostService.DeleteHostAsync(id);
            return success ? Results.Ok() : Results.NotFound();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .WithMetadata(new EndpointNameMetadata("Delete a host by ID"));

        app.MapPost("/hosts/assign", async (int hostId, int remoteId, HostService hostService) =>
        {
            // Logic to assign remote to host
            return Results.Ok();
        })
        .WithTags(GroupName)
        .Produces(StatusCodes.Status200OK)
        .WithMetadata(new EndpointNameMetadata("Assign a remote to a host"));

        app.MapGet("/hosts/environment/{environment}", async (string environment, HostService hostService) =>
        {
            var hosts = await hostService.GetHostsByEnvironmentAsync(environment);
            return Results.Ok(hosts);
        })
        .WithTags(GroupName)
        .Produces<List<HostResponse>>(StatusCodes.Status200OK)
        .WithMetadata(new EndpointNameMetadata("List hosts by environment"));
    }
}
