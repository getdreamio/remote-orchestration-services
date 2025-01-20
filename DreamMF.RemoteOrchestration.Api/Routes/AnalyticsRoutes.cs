using Microsoft.AspNetCore.Http.HttpResults;
using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class AnalyticsRoutes
{
    private const string GroupName = "Analytics";

    public static void MapAnalyticsRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/api/analytics").WithTags(GroupName);
        group.MapAnalyticsApi();
    }

    private static RouteGroupBuilder MapAnalyticsApi(this RouteGroupBuilder group)
    {
        group.RequireAuthorization();

        group.MapGet("summary", GetAnalyticsSummary)
            .Produces<AnalyticsSummary>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get Analytics Summary"))
            .WithSummary("Get Analytics Summary")
            .WithDescription("Gets a summary of analytics including top hosts/remotes and recent activity");

        group.MapGet("hosts", GetHostAnalytics)
            .Produces<List<EntityAnalytics>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get Host Analytics"))
            .WithSummary("Get Host Analytics")
            .WithDescription("Gets analytics for all hosts");

        group.MapGet("hosts/{id}", GetHostAnalyticsById)
            .Produces<EntityAnalytics>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get Host Analytics by ID"))
            .WithSummary("Get Host Analytics by ID")
            .WithDescription("Gets analytics for a specific host");

        group.MapGet("hosts/{id}/daily", GetDailyHostAnalytics)
            .Produces<List<DailyEntityAnalytics>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get Daily Host Analytics"))
            .WithSummary("Get Daily Host Analytics")
            .WithDescription("Gets daily analytics for a specific host");

        group.MapGet("remotes", GetRemoteAnalytics)
            .Produces<List<EntityAnalytics>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get Remote Analytics"))
            .WithSummary("Get Remote Analytics")
            .WithDescription("Gets analytics for all remotes");

        group.MapGet("remotes/{id}", GetRemoteAnalyticsById)
            .Produces<EntityAnalytics>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get Remote Analytics by ID"))
            .WithSummary("Get Remote Analytics by ID")
            .WithDescription("Gets analytics for a specific remote");

        group.MapGet("remotes/{id}/daily", GetDailyRemoteAnalytics)
            .Produces<List<DailyEntityAnalytics>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get Daily Remote Analytics"))
            .WithSummary("Get Daily Remote Analytics")
            .WithDescription("Gets daily analytics for a specific remote");

        group.MapGet("recent-remotes", GetRecentRemoteAnalytics)
            .Produces<RecentRemoteAnalytics>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get Recent Remote Analytics"))
            .WithSummary("Get Recent Remote Analytics")
            .WithDescription("Gets recent remote analytics");

        group.MapGet("relationships", GetRelationships)
            .Produces<RelationshipsModel>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get Relationships"))
            .WithSummary("Get Host and Remote Relationships")
            .WithDescription("Gets a graph of relationships between hosts and remotes");

        return group;
    }

    private static async Task<IResult> GetAnalyticsSummary(IAnalyticsService analyticsService)
    {
        var summary = new AnalyticsSummary
        {
            TopHosts = await analyticsService.GetHostAnalyticsAsync(),
            TopRemotes = await analyticsService.GetRemoteAnalyticsAsync(),
            RecentHostActivity = await analyticsService.GetDailyHostAnalyticsAsync(),
            RecentRemoteActivity = await analyticsService.GetDailyRemoteAnalyticsAsync()
        };
        return Results.Ok(summary);
    }

    private static async Task<IResult> GetHostAnalytics(IAnalyticsService analyticsService)
    {
        var analytics = await analyticsService.GetHostAnalyticsAsync();
        return Results.Ok(analytics);
    }

    private static async Task<IResult> GetHostAnalyticsById(int id, IAnalyticsService analyticsService)
    {
        var analytics = await analyticsService.GetHostAnalyticsByIdAsync(id);
        return analytics != null ? Results.Ok(analytics) : Results.NotFound();
    }

    private static async Task<IResult> GetDailyHostAnalytics(int id, IAnalyticsService analyticsService)
    {
        var analytics = await analyticsService.GetDailyHostAnalyticsAsync(id);
        return analytics.Any() ? Results.Ok(analytics) : Results.NotFound();
    }

    private static async Task<IResult> GetRemoteAnalytics(IAnalyticsService analyticsService)
    {
        var analytics = await analyticsService.GetRemoteAnalyticsAsync();
        return Results.Ok(analytics);
    }

    private static async Task<IResult> GetRemoteAnalyticsById(int id, IAnalyticsService analyticsService)
    {
        var analytics = await analyticsService.GetRemoteAnalyticsByIdAsync(id);
        return analytics != null ? Results.Ok(analytics) : Results.NotFound();
    }

    private static async Task<IResult> GetDailyRemoteAnalytics(int id, IAnalyticsService analyticsService)
    {
        var analytics = await analyticsService.GetDailyRemoteAnalyticsAsync(id);
        return analytics.Any() ? Results.Ok(analytics) : Results.NotFound();
    }

    private static async Task<IResult> GetRecentRemoteAnalytics(IAnalyticsService analyticsService)
    {
        var analytics = await analyticsService.GetRecentRemoteAnalyticsAsync();
        return analytics != null ? Results.Ok(analytics) : Results.NotFound();
    }

    private static async Task<IResult> GetRelationships(IAnalyticsService analyticsService)
    {
        var relationships = await analyticsService.GetRelationships();
        return relationships != null ? Results.Ok(relationships) : Results.NotFound();
    }
}