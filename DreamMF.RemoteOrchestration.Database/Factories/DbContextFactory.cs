using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Data.Sqlite;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Pomelo.EntityFrameworkCore.MySql;
using Microsoft.EntityFrameworkCore.Sqlite;

namespace DreamMF.RemoteOrchestration.Database;

public interface IDbContextFactory
{
    IRemoteOrchestrationDbContext CreateDbContext();
    IConfigurationDbContext CreateConfigurationDbContext();
    string GetSqlServerConnectionString(IConfigurationDbContext configContext);
    string GetPostgreSqlConnectionString(IConfigurationDbContext configContext);
    string GetMySqlConnectionString(IConfigurationDbContext configContext);
    string GetSqliteConnectionString(IConfigurationDbContext configContext);
}

public class DbContextFactory : IDbContextFactory
{
    private readonly IServiceProvider _serviceProvider;
    private const string DEFAULT_SQLITE_CONNECTION = "Data Source=remote_orchestration.db;Pooling=False;Cache=Shared";

    public DbContextFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IConfigurationDbContext CreateConfigurationDbContext()
    {
        var optionsBuilder = new DbContextOptionsBuilder<ConfigurationDbContext>();
        optionsBuilder.UseSqlite(DEFAULT_SQLITE_CONNECTION);
        return new ConfigurationDbContext(optionsBuilder.Options);
    }

    public IRemoteOrchestrationDbContext CreateDbContext()
    {
        var configContext = CreateConfigurationDbContext();
        var databaseType = GetDatabaseType(configContext);
        var connectionString = GetConnectionString(configContext, databaseType);
        
        var optionsBuilder = new DbContextOptionsBuilder<RemoteOrchestrationDbContext>();
        
        // Configure the DbContext based on the database type
        switch (databaseType.ToLowerInvariant())
        {
            case "sqlserver":
                // Use SQL Server
                ConfigureSqlServer(optionsBuilder, connectionString);
                break;
            case "postgresql":
                // Use PostgreSQL
                ConfigurePostgreSql(optionsBuilder, connectionString);
                break;
            case "mysql":
                // Use MySQL
                ConfigureMySql(optionsBuilder, connectionString);
                break;
            case "sqlite":
            default:
                // Always append no-pooling options for SQLite
                if (!connectionString.Contains("Pooling="))
                {
                    connectionString += ";Pooling=False;Cache=Shared";
                }
                optionsBuilder.UseSqlite(connectionString);
                break;
        }
        
        return new RemoteOrchestrationDbContext(optionsBuilder.Options);
    }
    
    private void ConfigureSqlServer(DbContextOptionsBuilder optionsBuilder, string connectionString)
    {
        // This method requires Microsoft.EntityFrameworkCore.SqlServer to be referenced
        typeof(Microsoft.EntityFrameworkCore.SqlServerDbContextOptionsExtensions)
            .GetMethod("UseSqlServer", new[] { typeof(DbContextOptionsBuilder), typeof(string) })
            ?.Invoke(null, new object[] { optionsBuilder, connectionString });
    }
    
    private void ConfigurePostgreSql(DbContextOptionsBuilder optionsBuilder, string connectionString)
    {
        // This method requires Npgsql.EntityFrameworkCore.PostgreSQL to be referenced
        Type npgsqlOptionsExtensionsType = Type.GetType("Npgsql.EntityFrameworkCore.PostgreSQL.NpgsqlDbContextOptionsBuilderExtensions, Npgsql.EntityFrameworkCore.PostgreSQL");
        npgsqlOptionsExtensionsType?
            .GetMethod("UseNpgsql", new[] { typeof(DbContextOptionsBuilder), typeof(string) })
            ?.Invoke(null, new object[] { optionsBuilder, connectionString });
    }
    
    private void ConfigureMySql(DbContextOptionsBuilder optionsBuilder, string connectionString)
    {
        // This method requires Pomelo.EntityFrameworkCore.MySql to be referenced
        Type mySqlOptionsExtensionsType = Type.GetType("Pomelo.EntityFrameworkCore.MySql.MySqlDbContextOptionsExtensions, Pomelo.EntityFrameworkCore.MySql");
        
        // First, need to get ServerVersion from connectionString
        Type serverVersionType = Type.GetType("Pomelo.EntityFrameworkCore.MySql.Infrastructure.ServerVersion, Pomelo.EntityFrameworkCore.MySql");
        var autoDetectMethod = serverVersionType?.GetMethod("AutoDetect", new[] { typeof(string) });
        var serverVersion = autoDetectMethod?.Invoke(null, new object[] { connectionString });
        
        mySqlOptionsExtensionsType?
            .GetMethod("UseMySql", new[] { typeof(DbContextOptionsBuilder), typeof(string), serverVersionType })
            ?.Invoke(null, new object[] { optionsBuilder, connectionString, serverVersion });
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

    private string GetConnectionString(IConfigurationDbContext configContext, string databaseType)
    {
        try
        {
            // Try to get a pre-built connection string if it exists
            var connectionConfig = configContext.Configurations
                .FirstOrDefault(c => c.Key == "DatabaseConnectionString");
                
            if (connectionConfig?.Value != null)
            {
                return connectionConfig.Value;
            }
            
            // If no connection string exists, build one based on the database type
            return BuildConnectionString(configContext, databaseType);
        }
        catch
        {
            return DEFAULT_SQLITE_CONNECTION;
        }
    }
    
    public string GetSqlServerConnectionString(IConfigurationDbContext configContext)
    {
        return BuildConnectionString(configContext, "sqlserver");
    }
    
    public string GetPostgreSqlConnectionString(IConfigurationDbContext configContext)
    {
        return BuildConnectionString(configContext, "postgresql");
    }
    
    public string GetMySqlConnectionString(IConfigurationDbContext configContext)
    {
        return BuildConnectionString(configContext, "mysql");
    }
    
    public string GetSqliteConnectionString(IConfigurationDbContext configContext)
    {
        return BuildConnectionString(configContext, "sqlite");
    }
    
    private string BuildConnectionString(IConfigurationDbContext configContext, string databaseType)
    {
        var dbConfigs = configContext.Configurations
            .Where(c => c.Key.StartsWith("database:"))
            .ToDictionary(c => c.Key, c => c.Value);
            
        switch (databaseType.ToLowerInvariant())
        {
            case "sqlserver":
                var sqlServerHost = dbConfigs.GetValueOrDefault("database:host", "localhost");
                var sqlServerPort = dbConfigs.GetValueOrDefault("database:port", "1433");
                var sqlServerDb = dbConfigs.GetValueOrDefault("database:name", "RemoteOrchestration");
                var sqlServerUser = dbConfigs.GetValueOrDefault("database:user", "sa");
                var sqlServerPassword = dbConfigs.GetValueOrDefault("database:password", "");
                
                return $"Server={sqlServerHost},{sqlServerPort};Database={sqlServerDb};User Id={sqlServerUser};Password={sqlServerPassword};TrustServerCertificate=True;";
                
            case "postgresql":
                var pgHost = dbConfigs.GetValueOrDefault("database:host", "localhost");
                var pgPort = dbConfigs.GetValueOrDefault("database:port", "5432");
                var pgDb = dbConfigs.GetValueOrDefault("database:name", "RemoteOrchestration");
                var pgUser = dbConfigs.GetValueOrDefault("database:user", "postgres");
                var pgPassword = dbConfigs.GetValueOrDefault("database:password", "");
                
                return $"Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password={pgPassword};";
                
            case "mysql":
                var mysqlHost = dbConfigs.GetValueOrDefault("database:host", "localhost");
                var mysqlPort = dbConfigs.GetValueOrDefault("database:port", "3306");
                var mysqlDb = dbConfigs.GetValueOrDefault("database:name", "RemoteOrchestration");
                var mysqlUser = dbConfigs.GetValueOrDefault("database:user", "root");
                var mysqlPassword = dbConfigs.GetValueOrDefault("database:password", "");
                
                return $"Server={mysqlHost};Port={mysqlPort};Database={mysqlDb};User={mysqlUser};Password={mysqlPassword};";
                
            case "sqlite":
            default:
                var sqliteFileName = dbConfigs.GetValueOrDefault("database:filename", "remote_orchestration.db");
                return $"Data Source={sqliteFileName}";
        }
    }
}
