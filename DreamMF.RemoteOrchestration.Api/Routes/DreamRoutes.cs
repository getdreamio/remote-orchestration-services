using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class DreamRoutes
{
    private const string GroupName = "Dream";

    public static void MapDreamRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/api/dreammf").WithTags(GroupName);
        group.MapExtenalApi();
    }

    private static RouteGroupBuilder MapExtenalApi(this RouteGroupBuilder group)
    {

        group.MapGet("/hosts/{accessKey}/", GetHostDetailsByAccessKey)
            .WithTags(GroupName)
            .Produces<HostResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Gets host details by Access Key"))
            .WithSummary("Gets host details by Access Key")
            .WithDescription("Gets host detailed information by Access Key");

        group.MapGet("/hosts/{accessKey}/remotes", GetAttachedRemotesByAccessKey)
            .WithTags(GroupName)
            .Produces<List<RemoteResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get remotes by host by Access Key"))
            .WithSummary("Get remotes by host by Access Key")
            .WithDescription("Gets all attached remotes for a host by its access key");

        group.MapGet("/hosts/{accessKey}/remote/{key}", GetRemoteByAccessKeyAndName)
            .WithTags(GroupName)
            .Produces<RemoteResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Reads remote using access key and remote key"))
            .WithSummary("Reads remote using access key and remote key")
            .WithDescription("Reads remote using access key and remote key");

        return group;
    }

    private static async Task<IResult> GetHostDetailsByAccessKey(string accessKey, IDreamService service)
    {
        var result = await service.GetHostDetailsByAccessKey(accessKey);
        return result != null ? Results.Ok(result) : Results.NotFound();
    }

    private static async Task<IResult> GetAttachedRemotesByAccessKey(string accessKey, IDreamService service)
    {
        var result = await service.GetAttachedRemotesByAccessKey(accessKey);
        return result != null ? Results.Ok(result) : Results.NotFound();
    }

    private static async Task<IResult> GetRemoteByAccessKeyAndName(string accessKey, string key, IDreamService service)
    {
        var result = await service.GetRemoteByAccessKeyAndName(accessKey, key);
        return result != null ? Results.Ok(result) : Results.NotFound();
    }
}