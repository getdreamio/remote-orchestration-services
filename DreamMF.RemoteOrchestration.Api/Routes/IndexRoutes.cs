using Microsoft.AspNetCore.Builder;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class IndexRoutes
{
    public static void MapIndexRoutes(this WebApplication app)
    {
        app.MapGet("/", () => Results.Redirect("/swagger"))
        .ExcludeFromDescription();
    }
}
