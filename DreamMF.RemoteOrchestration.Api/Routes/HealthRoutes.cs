using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using DreamMF.RemoteOrchestration.Database;
using Microsoft.EntityFrameworkCore;
using System;
using Microsoft.Extensions.Configuration;

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

    public static IHealthChecksBuilder AddHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        var healthChecks = services.AddHealthChecks();
        
        // Register database health checks based on configuration
        RegisterDatabaseHealthChecks(healthChecks, services);
        
        // Register storage health checks
        RegisterStorageHealthChecks(healthChecks, configuration);
        
        return healthChecks;
    }
    
    private static void RegisterDatabaseHealthChecks(IHealthChecksBuilder healthChecks, IServiceCollection services)
    {
        try
        {
            var dbFactory = new DbContextFactory(services.BuildServiceProvider());
            var configContext = dbFactory.CreateConfigurationDbContext();
            var dbTypeConfig = configContext.Configurations
                .FirstOrDefault(c => c.Key == "database:type");
            var dbType = dbTypeConfig?.Value?.ToLowerInvariant() ?? "sqlite";

            // Add the appropriate database health check based on configuration
            switch (dbType)
            {
                case "sqlserver":
                    var sqlServerConnectionString = dbFactory.GetSqlServerConnectionString(configContext);
                    healthChecks.AddSqlServer(sqlServerConnectionString, name: "SQL Server Database");
                    break;
                case "postgresql":
                    var pgConnectionString = dbFactory.GetPostgreSqlConnectionString(configContext);
                    healthChecks.AddNpgSql(pgConnectionString, name: "PostgreSQL Database");
                    break;
                case "mysql":
                    var mysqlConnectionString = dbFactory.GetMySqlConnectionString(configContext);
                    healthChecks.AddMySql(mysqlConnectionString, name: "MySQL Database");
                    break;
                case "sqlite":
                default:
                    healthChecks.AddDbContextCheck<RemoteOrchestrationDbContext>("SQLite Database");
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error configuring database health checks: {ex.Message}");
            // Default to SQLite if there's an error
            healthChecks.AddDbContextCheck<RemoteOrchestrationDbContext>("SQLite Database");
        }
    }
    
    private static void RegisterStorageHealthChecks(IHealthChecksBuilder healthChecks, IConfiguration configuration)
    {
        healthChecks.AddAzureBlobStorage(configuration["AzureBlobStorage:ConnectionString"], name: "Azure Blob Storage")
            .AddS3(options =>
            {
                options.AccessKey = configuration["S3Storage:AccessKeyId"];
                options.SecretKey = configuration["S3Storage:SecretAccessKey"];
                options.BucketName = "your-bucket-name"; // Replace with actual bucket name
                options.S3Config = new Amazon.S3.AmazonS3Config
                {
                    RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(configuration["S3Storage:Region"])
                };
            }, name: "AWS S3");
    }
}
