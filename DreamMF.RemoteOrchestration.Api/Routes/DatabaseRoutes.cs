using Microsoft.AspNetCore.Http;
using DreamMF.RemoteOrchestration.Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class DatabaseRoutes
{
    public static void MapDatabaseRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/database")
            .WithTags("Database")
            .RequireAuthorization();
            //.RequireAuthorization(policy => policy.RequireRole("Administrator"));

        group.MapGet("/backup", async (IBackupService backupService) =>
            {
                var (fileContent, fileName) = await backupService.GetDatabaseBackupAsync();
                return Results.File(fileContent, "application/octet-stream", fileName);
            })
            .WithName("DownloadDatabase")
            .WithDescription("Download a backup of the database file");

        group.MapPost("/restore", async (IFormFile file, IBackupService backupService) =>
            {
                await backupService.RestoreDatabaseAsync(file);
                return Results.Ok("Database restored successfully");
            })
            .WithName("RestoreDatabase")
            .WithDescription("Upload and restore a database backup file")
            .DisableAntiforgery();
    }
}
