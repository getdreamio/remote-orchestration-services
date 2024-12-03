using Microsoft.AspNetCore.Builder;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class HealthRoutes
{
    private const string GroupName = "Health";

    public static void MapHealthRoutes(this WebApplication app)
    {
        app.MapGet("/readiness", () => Results.Ok("Service is ready"))
            .WithTags(GroupName)
            .Produces<string>(StatusCodes.Status200OK)
            .WithMetadata(new EndpointNameMetadata("Readiness check"));

        app.MapGet("/liveness", () => Results.Ok("Service is live"))
            .WithTags(GroupName)
            .Produces<string>(StatusCodes.Status200OK)
            .WithMetadata(new EndpointNameMetadata("Liveness check"));

        app.MapGet("/health", () => Results.Ok("Service is healthy"))
            .WithTags(GroupName)
            .Produces<string>(StatusCodes.Status200OK)
            .WithMetadata(new EndpointNameMetadata("Health check"));

        app.UseHealthChecks("/health/dependencies");
    }
}
