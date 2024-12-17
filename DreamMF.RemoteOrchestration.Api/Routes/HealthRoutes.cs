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
            .WithMetadata(new EndpointNameMetadata("Readiness check"))
            .WithSummary("Check Service Readiness")
            .WithDescription("Endpoint to verify if the service is ready to accept requests");

        app.MapGet("/liveness", () => Results.Ok("Service is live"))
            .WithTags(GroupName)
            .Produces<string>(StatusCodes.Status200OK)
            .WithMetadata(new EndpointNameMetadata("Liveness check"))
            .WithSummary("Check Service Liveness")
            .WithDescription("Endpoint to verify if the service is currently running and responsive");

        app.MapGet("/health", () => Results.Ok("Service is healthy"))
            .WithTags(GroupName)
            .Produces<string>(StatusCodes.Status200OK)
            .WithMetadata(new EndpointNameMetadata("Health check"))
            .WithSummary("Check Service Health")
            .WithDescription("Endpoint to verify the overall health status of the service");

        app.UseHealthChecks("/health/dependencies");
    }
}
