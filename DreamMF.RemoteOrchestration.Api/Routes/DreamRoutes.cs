using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class DreamRoutes
{
    private const string GroupName = "Dream";

    public static void MapDreamRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/api/dreammf").WithTags(GroupName);
        
        // Get the memory cache service
        var cache = app.Services.GetRequiredService<IMemoryCache>();
        
        group.MapExtenalApi(cache);
    }

    private static RouteGroupBuilder MapExtenalApi(this RouteGroupBuilder group, IMemoryCache cache)
    {

        group.MapGet("/hosts/{accessKey}/", GetHostDetailsByAccessKey)
            .WithTags(GroupName)
            .Produces<DreamHostResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Gets host details by Access Key"))
            .WithSummary("Gets host details by Access Key")
            .WithDescription("Gets host detailed information by Access Key");

        group.MapGet("/hosts/{accessKey}/remotes", GetAttachedRemotesByAccessKey)
            .WithTags(GroupName)
            .Produces<List<DreamRemoteResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get remotes by host by Access Key"))
            .WithSummary("Get remotes by host by Access Key")
            .WithDescription("Gets all attached remotes for a host by its access key");

        group.MapGet("/hosts/{accessKey}/remote/{key}", GetRemoteByAccessKeyAndName)
            .WithTags(GroupName)
            .Produces<RemoteSummaryResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Reads remote using access key and remote key"))
            .WithSummary("Reads remote using access key and remote key")
            .WithDescription("Reads remote using access key and remote key");

        group.MapGet("/hosts/{accessKey}/variables", GetHostVariablesByAccessKey)
            .WithTags(GroupName)
            .Produces<List<HostVariableResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get host configuration variables by access key"))
            .WithSummary("Get Host Configuration Variables By Access Key")
            .WithDescription("Retrieves all configuration variables for a host using its access key");

        return group;
    }

    private static async Task<IResult> GetHostDetailsByAccessKey(string accessKey, IDreamService service, IMemoryCache cache)
    {
        var cacheKey = $"host_{accessKey}";
        if (!cache.TryGetValue(cacheKey, out DreamHostResponse? cachedResult))
        {
            cachedResult = await service.GetHostDetailsByAccessKey(accessKey);
            if (cachedResult != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(3));
                cache.Set(cacheKey, cachedResult, cacheOptions);
            }
        }
        return cachedResult != null ? Results.Ok(cachedResult) : Results.NotFound();
    }

    private static async Task<IResult> GetAttachedRemotesByAccessKey(string accessKey, IDreamService service, IMemoryCache cache)
    {
        var cacheKey = $"remotes_{accessKey}";
        if (!cache.TryGetValue(cacheKey, out List<DreamRemoteResponse>? cachedResult))
        {
            cachedResult = await service.GetAttachedRemotesByAccessKey(accessKey);
            if (cachedResult != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(3));
                cache.Set(cacheKey, cachedResult, cacheOptions);
            }
        }
        return cachedResult != null ? Results.Ok(cachedResult) : Results.NotFound();
    }

    private static async Task<IResult> GetRemoteByAccessKeyAndName(string accessKey, string key, IDreamService service, IMemoryCache cache)
    {
        var cacheKey = $"remote_{accessKey}_{key}";
        if (!cache.TryGetValue(cacheKey, out RemoteSummaryResponse? cachedResult))
        {
            cachedResult = await service.GetRemoteByAccessKeyAndName(accessKey, key);
            if (cachedResult != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(3));
                cache.Set(cacheKey, cachedResult, cacheOptions);
            }
        }
        return cachedResult != null ? Results.Ok(cachedResult) : Results.NotFound();
    }

    private static async Task<IResult> GetHostVariablesByAccessKey(string accessKey, IDreamService service, IMemoryCache cache)
    {
        var cacheKey = $"variables_{accessKey}";
        if (!cache.TryGetValue(cacheKey, out List<HostVariableResponse>? cachedResult))
        {
            cachedResult = await service.GetHostVariablesByAccessKey(accessKey);
            // We don't need to check for null since the service returns an empty list if no variables are found
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(3));
            cache.Set(cacheKey, cachedResult, cacheOptions);
        }
        return Results.Ok(cachedResult);
    }
}