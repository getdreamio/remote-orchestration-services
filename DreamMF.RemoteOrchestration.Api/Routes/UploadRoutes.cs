using DreamMF.RemoteOrchestration.Core.Exceptions;
using DreamMF.RemoteOrchestration.Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Antiforgery;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class UploadRoutes
{
    private const string GroupName = "Upload";

    public static void MapUploadRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/api/upload").WithTags(GroupName);
        group.MapUploadApi();
    }

    private static RouteGroupBuilder MapUploadApi(this RouteGroupBuilder group)
    {
        group.RequireAuthorization();

        group.MapPost("/remote/{name}/{version}/{key}/{scope}", UploadRemoteZip)
            .RequireAuthorization(new[] { "Administrator", "CanUploadRemotes" })
            .WithTags(GroupName)
            .Produces(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Upload Remote Zip"))
            .WithSummary("Upload Remote Zip")
            .WithDescription("Upload and extract a remote zip file to the specified remote name and version folder")
            .DisableAntiforgery();  // Since this is a file upload endpoint, we'll disable anti-forgery for it

        return group;
    }

    private static async Task<IResult> UploadRemoteZip(
        [FromRoute] string name,
        [FromRoute] string version,
        [FromRoute] string key,
        [FromRoute] string scope,
        IFormFile file,
        IUploadService uploadService)
    {
        if (file == null)
            return Results.BadRequest(new HandledResponseModel("File is required", System.Net.HttpStatusCode.BadRequest));

        if (!file.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
            return Results.BadRequest(new HandledResponseModel("File must be a zip archive", System.Net.HttpStatusCode.BadRequest));

        using var stream = file.OpenReadStream();
        await uploadService.ExtractAndSaveRemoteAsync(name, version, key, scope, stream);
        
        return Results.Ok();
    }
}
