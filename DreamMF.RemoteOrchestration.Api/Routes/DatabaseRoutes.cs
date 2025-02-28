using Microsoft.AspNetCore.Http;
using DreamMF.RemoteOrchestration.Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DreamMF.RemoteOrchestration.Core.Models;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public class DatabaseConnectionTestRequest
{
    public string DatabaseType { get; set; } = "sqlite";
    public string? Host { get; set; }
    public string? Port { get; set; }
    public string? Database { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? Filename { get; set; }
    public string? ConnectionString { get; set; }
}

public class DatabaseConnectionTestResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ConnectionString { get; set; }
}

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
            
        group.MapPost("/test-connection", async (DatabaseConnectionTestRequest request, IDatabaseConnectionService databaseService) =>
            {
                try
                {
                    string connectionString = request.ConnectionString ?? "";
                    
                    // If connectionString is not provided, build it from the individual parts
                    if (string.IsNullOrEmpty(connectionString))
                    {
                        connectionString = await databaseService.BuildConnectionStringAsync(
                            request.DatabaseType,
                            request.Host ?? "",
                            request.Port ?? "",
                            request.Database ?? "",
                            request.Username ?? "",
                            request.Password ?? "",
                            request.Filename ?? "");
                    }
                    
                    var success = await databaseService.TestConnectionAsync(request.DatabaseType, connectionString);
                    
                    return Results.Ok(new DatabaseConnectionTestResponse
                    {
                        Success = success,
                        Message = success ? "Connection successful" : "Failed to connect to the database",
                        ConnectionString = connectionString
                    });
                }
                catch (Exception ex)
                {
                    return Results.BadRequest(new DatabaseConnectionTestResponse
                    {
                        Success = false,
                        Message = ex.Message
                    });
                }
            })
            .WithName("TestDatabaseConnection")
            .WithDescription("Test a database connection with the provided parameters");
    }
}
