using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DreamMF.RemoteOrchestration.Database;

public interface IDbContextFactory
{
    IRemoteOrchestrationDbContext CreateDbContext();
    IConfigurationDbContext CreateConfigurationDbContext();
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
        var connectionString = GetConnectionString(configContext);
        
        // Always append no-pooling options
        if (!connectionString.Contains("Pooling="))
        {
            connectionString += ";Pooling=False;Cache=Shared";
        }
        
        var optionsBuilder = new DbContextOptionsBuilder<RemoteOrchestrationDbContext>();
        optionsBuilder.UseSqlite(connectionString);
        
        return new RemoteOrchestrationDbContext(optionsBuilder.Options);
    }

    private string GetConnectionString(IConfigurationDbContext configContext)
    {
        try
        {
            var connectionConfig = configContext.Configurations
                .FirstOrDefault(c => c.Key == "DatabaseConnectionString");

            return connectionConfig?.Value ?? DEFAULT_SQLITE_CONNECTION;
        }
        catch
        {
            return DEFAULT_SQLITE_CONNECTION;
        }
    }
}
