using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IRootConfigurationService
{
    Task<List<ConfigurationResponse>> GetAllConfigurationsAsync();
    Task<ConfigurationResponse?> GetConfigurationByKeyAsync(string key);
    Task<ConfigurationResponse> CreateConfigurationAsync(ConfigurationRequest request);
    Task<ConfigurationResponse?> UpdateConfigurationAsync(string key, string value);
    string GetDatabaseConnectionString();
}

public class RootConfigurationService : IRootConfigurationService
{
    private readonly IConfiguration _configuration;
    private readonly IConfigurationDbContext _dbContext;
    private const string DEFAULT_CONNECTION = "Data Source=remote_orchestration.db";

    public RootConfigurationService(
        IConfiguration configuration,
        IConfigurationDbContext dbContext)
    {
        _configuration = configuration;
        _dbContext = dbContext;
    }

    public string GetDatabaseConnectionString()
    {
        try
        {
            var connectionConfig = _dbContext.Configurations
                .FirstOrDefault(c => c.Key == "DatabaseConnectionString");

            if (connectionConfig != null)
                return connectionConfig.Value;

            var configConnection = _configuration.GetConnectionString("DefaultConnection");
            if (!string.IsNullOrEmpty(configConnection))
                return configConnection;

            return DEFAULT_CONNECTION;
        }
        catch
        {
            return DEFAULT_CONNECTION;
        }
    }

    public async Task<List<ConfigurationResponse>> GetAllConfigurationsAsync()
    {
        var configurations = await _dbContext.Configurations
            .OrderBy(c => c.Key)
            .Select(c => new ConfigurationResponse
            {
                Id = c.Configuration_ID,
                Key = c.Key,
                Value = c.Value,
                Created_Date = c.Created_Date,
                Updated_Date = c.Updated_Date
            })
            .ToListAsync();

        return configurations;
    }

    public async Task<ConfigurationResponse?> GetConfigurationByKeyAsync(string key)
    {
        var configuration = await _dbContext.Configurations
            .Where(c => c.Key == key)
            .Select(c => new ConfigurationResponse
            {
                Id = c.Configuration_ID,
                Key = c.Key,
                Value = c.Value,
                Created_Date = c.Created_Date,
                Updated_Date = c.Updated_Date
            })
            .FirstOrDefaultAsync();

        return configuration;
    }

    public async Task<ConfigurationResponse> CreateConfigurationAsync(ConfigurationRequest request)
    {
        var configuration = new Database.Entities.Configuration
        {
            Key = request.Key,
            Value = request.Value,
            Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        };

        _dbContext.Configurations.Add(configuration);
        await _dbContext.SaveChangesAsync();

        return new ConfigurationResponse
        {
            Id = configuration.Configuration_ID,
            Key = configuration.Key,
            Value = configuration.Value,
            Created_Date = configuration.Created_Date,
            Updated_Date = configuration.Updated_Date
        };
    }

    public async Task<ConfigurationResponse?> UpdateConfigurationAsync(string key, string value)
    {
        var configuration = await _dbContext.Configurations
            .FirstOrDefaultAsync(c => c.Key == key);

        if (configuration == null)
            return null;

        configuration.Value = value;
        configuration.Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        await _dbContext.SaveChangesAsync();

        return new ConfigurationResponse
        {
            Id = configuration.Configuration_ID,
            Key = configuration.Key,
            Value = configuration.Value,
            Created_Date = configuration.Created_Date,
            Updated_Date = configuration.Updated_Date
        };
    }
}
