using DreamMF.RemoteOrchestration.Core.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace DreamMF.RemoteOrchestration.Core.Extensions
{
    public static class MigrationExtensions
    {
        /// <summary>
        /// Applies pending migrations for all DbContexts using the configured database provider
        /// </summary>
        public static async Task<WebApplication> MigrateDatabaseAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var services = scope.ServiceProvider;
            var logger = services.GetRequiredService<ILogger<Program>>();
            
            try
            {
                logger.LogInformation("Starting automatic database migration on application startup");
                var migrationService = services.GetRequiredService<IDatabaseMigrationService>();
                await migrationService.MigrateAsync();
                logger.LogInformation("Automatic database migration completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while migrating the database");
                // Don't throw here - we want the application to start even if migrations fail
                // The application can show appropriate error messages to administrators
            }
            
            return app;
        }
        
        /// <summary>
        /// Creates database migration scripts for a specific provider
        /// </summary>
        public static void AddMigration<TContext>(string provider, string migrationName) where TContext : DbContext
        {
            // This is a placeholder - in a real application this would call EF Core's migration commands
            // In practice, migrations are typically created using CLI commands rather than code
            // dotnet ef migrations add <migrationName> --context <contextName> --provider <providerName>
        }
    }
}
