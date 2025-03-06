using DreamMF.RemoteOrchestration.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Threading.Tasks;

namespace DreamMF.RemoteOrchestration.Core.Services
{
    public interface IDatabaseMigrationService
    {
        Task MigrateAsync();
        Task<bool> TestConnectionAsync();
    }

    public class DatabaseMigrationService : IDatabaseMigrationService
    {
        private readonly IDbContextFactory _dbContextFactory;
        private readonly ILogger<DatabaseMigrationService> _logger;

        public DatabaseMigrationService(IDbContextFactory dbContextFactory, ILogger<DatabaseMigrationService> logger)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
        }

        public async Task MigrateAsync()
        {
            _logger.LogInformation("Starting database migration process");

            // Always migrate ConfigurationDbContext first as it contains the database settings
            await MigrateConfigurationDbContextAsync();
            
            // Then migrate the main database
            await MigrateMainDbContextAsync();

            _logger.LogInformation("Database migration process completed successfully");
        }

        private async Task MigrateConfigurationDbContextAsync()
        {
            using var configContext = _dbContextFactory.CreateConfigurationDbContext();
            _logger.LogInformation("Migrating configuration database...");
            
            try
            {
                // For SQLite we need to ensure the database is created first
                await configContext.Database.EnsureCreatedAsync();
                
                if ((await configContext.Database.GetPendingMigrationsAsync()).Any())
                {
                    _logger.LogInformation("Applying {Count} pending migrations to configuration database", 
                        (await configContext.Database.GetPendingMigrationsAsync()).Count());
                    await configContext.Database.MigrateAsync();
                }
                else
                {
                    _logger.LogInformation("Configuration database is up to date");
                }
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error migrating configuration database");
                throw;
            }
        }

        private async Task MigrateMainDbContextAsync()
        {
            using var configContext = _dbContextFactory.CreateConfigurationDbContext();
            var databaseType = GetDatabaseType(configContext);
            
            _logger.LogInformation("Migrating main database using provider: {Provider}", databaseType);
            
            using var mainContext = _dbContextFactory.CreateDbContext();
            
            try
            {
                // For SQLite we need to ensure the database is created first
                if (databaseType.Equals("sqlite", System.StringComparison.OrdinalIgnoreCase))
                {
                    await mainContext.Database.EnsureCreatedAsync();
                }
                
                if ((await mainContext.Database.GetPendingMigrationsAsync()).Any())
                {
                    _logger.LogInformation("Applying {Count} pending migrations to main database",
                        (await mainContext.Database.GetPendingMigrationsAsync()).Count());
                    await mainContext.Database.MigrateAsync();
                }
                else
                {
                    _logger.LogInformation("Main database is up to date");
                }
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error migrating main database. Type: {DatabaseType}, Error: {Error}", 
                    databaseType, ex.Message);
                throw;
            }
        }

        private string GetDatabaseType(IConfigurationDbContext configContext)
        {
            try
            {
                var dbTypeConfig = configContext.Configurations
                    .FirstOrDefault(c => c.Key == "database:type");

                return dbTypeConfig?.Value?.ToLowerInvariant() ?? "sqlite";
            }
            catch
            {
                return "sqlite";
            }
        }

        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                using var configContext = _dbContextFactory.CreateConfigurationDbContext();
                await configContext.Database.CanConnectAsync();
                
                using var mainContext = _dbContextFactory.CreateDbContext();
                return await mainContext.Database.CanConnectAsync();
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Database connection test failed");
                return false;
            }
        }
    }
}
