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
            .Produces<HostRemoteResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Attach remote to host"))
            .WithSummary("Attach Remote to Host")
            .WithDescription("Associates a remote instance with a specific host instance");

        group.MapPost("/{id}/detach", DetachRemoteFromHost)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditHosts" })
            .WithTags(GroupName)
            .Produces<HostRemoteResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Detaches a remote from a host"))
            .WithSummary("Detaches a Remote from a Host")
            .WithDescription("Detaches a remote instance from a specific host instance");

        group.MapPost("/{id}/remotes/set-current-version", SetCurrentVersionOverride)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditHosts" })
            .WithTags(GroupName)
            .Produces<HostRemoteResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Set current version for a host-remote relationship"))
            .WithSummary("Set Current Version")
            .WithDescription("Sets the current version URL override for a host-remote relationship");

        group.MapGet("/environment/{environment}", GetHostsByEnvironment)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<List<HostResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List hosts by environment"))
            .WithSummary("List Hosts by Environment")
            .WithDescription("Retrieves a list of host instances associated with a specific environment");

        // Host Variables endpoints
        group.MapGet("/{id}/variables", GetHostVariables)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<List<HostVariableResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List variables for a host"))
            .WithSummary("Get Host Variables")
            .WithDescription("Retrieves all variables associated with a specific host");

        group.MapGet("/{id}/variables/{variableId}", GetHostVariableById)
            .RequireAuthorization()
            .WithTags(GroupName)
            .Produces<HostVariableResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get host variable by ID"))
            .WithSummary("Get Host Variable by ID")
            .WithDescription("Retrieves a specific variable for a host by its ID");

        group.MapPost("/{id}/variables", CreateHostVariable)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditHosts" })
            .WithTags(GroupName)
            .Produces<HostVariableResponse>(StatusCodes.Status201Created)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Create a host variable"))
            .WithSummary("Create Host Variable")
            .WithDescription("Creates a new variable for a specific host");

        group.MapPut("/{id}/variables/{variableId}", UpdateHostVariable)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditHosts" })
            .WithTags(GroupName)
            .Produces<HostVariableResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Update a host variable"))
            .WithSummary("Update Host Variable")
            .WithDescription("Updates an existing variable for a specific host");

        group.MapDelete("/{id}/variables/{variableId}", DeleteHostVariable)
            .RequireAuthorization(new[] { "Administrator", "CanCreateEditHosts" })
            .WithTags(GroupName)
            .Produces(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Delete a host variable"))
            .WithSummary("Delete Host Variable")
            .WithDescription("Deletes a specific variable from a host");

        // Access key endpoint - no authorization required as it uses the access key for security
        group.MapGet("/variables/access/{accessKey}", GetHostVariablesByAccessKey)
            .WithTags(GroupName)
            .Produces<List<HostVariableResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .WithMetadata(new EndpointNameMetadata("Get host variables by access key"))
            .WithSummary("Get Host Variables By Access Key")
            .WithDescription("Retrieves all variables for a host using its access key");

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
        var hostRemote = await hostService.AttachRemoteToHostAsync(id, request.RemoteId);
        return hostRemote != null ? Results.Ok(hostRemote) : Results.BadRequest();
    }

    private static async Task<IResult> DetachRemoteFromHost(int id, AttachRemoteRequest request, HostService hostService)
    {
        var hostRemote = await hostService.DetachRemoteFromHostAsync(id, request.RemoteId);
        return hostRemote != null ? Results.Ok(hostRemote) : Results.BadRequest();
    }

    private static async Task<IResult> GetHostsByEnvironment(string environment, HostService hostService)
    {
        var hosts = await hostService.GetHostsByEnvironmentAsync(environment);
        return Results.Ok(hosts);
    }

    // Host Variables handlers
    private static async Task<IResult> GetHostVariables(int id, HostService hostService)
    {
        var variables = await hostService.GetHostVariablesAsync(id);
        return Results.Ok(variables);
    }

    private static async Task<IResult> GetHostVariableById(int id, int variableId, HostService hostService)
    {
        var variable = await hostService.GetHostVariableByIdAsync(id, variableId);
        return variable != null ? Results.Ok(variable) : Results.BadRequest();
    }

    private static async Task<IResult> CreateHostVariable(int id, HostVariableRequest request, HostService hostService)
    {
        var variable = await hostService.CreateHostVariableAsync(id, request);
        return Results.Created($"/hosts/{id}/variables/{variable.Id}", variable);
    }

    private static async Task<IResult> UpdateHostVariable(int id, int variableId, HostVariableRequest request, HostService hostService)
    {
        var variable = await hostService.UpdateHostVariableAsync(id, variableId, request);
        return variable != null ? Results.Ok(variable) : Results.BadRequest();
    }

    private static async Task<IResult> DeleteHostVariable(int id, int variableId, HostService hostService)
    {
        var success = await hostService.DeleteHostVariableAsync(id, variableId);
        return success ? Results.Ok() : Results.BadRequest();
    }

    // Handler for the access key endpoint
    private static async Task<IResult> GetHostVariablesByAccessKey(string accessKey, HostService hostService)
    {
        var variables = await hostService.GetHostVariablesByAccessKeyAsync(accessKey);
        return variables != null ? Results.Ok(variables) : Results.NotFound();
    }

    private static async Task<IResult> SetCurrentVersionOverride(int id, SetCurrentVersionOverrideRequest request, HostService hostService)
    {
        var hostRemote = await hostService.SetCurrentVersionOverrideAsync(id, request.RemoteId, request.Url);
        return hostRemote != null ? Results.Ok(hostRemote) : Results.BadRequest();
    }
}