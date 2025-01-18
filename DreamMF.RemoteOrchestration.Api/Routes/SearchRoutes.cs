using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;

namespace DreamMF.RemoteOrchestration.Api.Routes;

/// <summary>
/// Provides route configuration for search-related endpoints
/// </summary>
public static class SearchRoutes
{
    private const string GroupName = "Search";

    /// <summary>
    /// Maps all search-related routes for the application
    /// </summary>
    /// <param name="app">The web application to configure routes for</param>
    public static void MapSearchRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/api/search").WithTags(GroupName);
        group.MapSearchApi();
    }

    /// <summary>
    /// Configures the search API endpoints for the route group
    /// </summary>
    /// <param name="group">The route group to configure</param>
    private static RouteGroupBuilder MapSearchApi(this RouteGroupBuilder group)
    {
        group.MapPost("", Search)
            .Produces<Core.Models.SearchResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Search entities"))
            .WithSummary("Search")
            .WithDescription("Searches across hosts and remotes based on provided search text");

        return group;
    }

    private static async Task<IResult> Search(SearchRequest request, SearchService searchService)
    {
        if (string.IsNullOrWhiteSpace(request.SearchText))
        {
            throw new HandledException(ExceptionType.Validation, "Search text cannot be empty");
        }

        var results = await searchService.SearchAsync(request.SearchText);
        return Results.Ok(results);
    }
}
