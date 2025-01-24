using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Mappers;
using Microsoft.EntityFrameworkCore;
using DreamMF.RemoteOrchestration.Database;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class ConfigurationService
{
    private readonly IConfigurationDbContext _dbContext;

    public ConfigurationService(IConfigurationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationResponse>> GetAllConfigurationsAsync()
    {
        var configurations = await _dbContext.Configurations
            .OrderBy(c => c.Key)
            .Select(c => c.ToResponse())
            .ToListAsync();

        return configurations;
    }

    public async Task<ConfigurationResponse?> GetConfigurationByIdAsync(int id)
    {
        var configuration = await _dbContext.Configurations
            .Where(c => c.Configuration_ID == id)
            .Select(c => c.ToResponse())
            .FirstOrDefaultAsync();

        return configuration;
    }

    public async Task<ConfigurationResponse?> GetConfigurationByKeyAsync(string key)
    {
        var configuration = await _dbContext.Configurations
            .Where(c => c.Key == key)
            .Select(c => c.ToResponse())
            .FirstOrDefaultAsync();

        return configuration;
    }

    public async Task<ConfigurationResponse> CreateConfigurationAsync(ConfigurationRequest request)
    {
        var configuration = request.ToEntity();

        _dbContext.Configurations.Add(configuration);
        await _dbContext.SaveChangesAsync();

        return configuration.ToResponse();
    }

    public async Task<ConfigurationResponse?> UpdateConfigurationAsync(ConfigurationRequest request)
    {
        var configuration = await _dbContext.Configurations
            .FirstOrDefaultAsync(c => c.Key == request.Key);

        if (configuration == null)
        {
            // Create new configuration if it doesn't exist
            configuration = request.ToEntity();
            _dbContext.Configurations.Add(configuration);
        }
        else
        {
            // Update existing configuration
            configuration.Value = request.Value;
            configuration.Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        await _dbContext.SaveChangesAsync();
        return configuration.ToResponse();
    }

    public async Task<List<ConfigurationResponse>> UpdateConfigurationBatchAsync(List<ConfigurationRequest> requests)
    {
        var updatedConfigurations = new List<ConfigurationResponse>();

        foreach (var request in requests)
        {
            var configuration = await _dbContext.Configurations
                .FirstOrDefaultAsync(c => c.Key == request.Key);

            if (configuration == null)
            {
                // Create new configuration if it doesn't exist
                configuration = request.ToEntity();
                _dbContext.Configurations.Add(configuration);
            }
            else
            {
                // Update existing configuration
                configuration.Value = request.Value;
                configuration.Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            }

            updatedConfigurations.Add(configuration.ToResponse());
        }

        await _dbContext.SaveChangesAsync();
        return updatedConfigurations;
    }

    public async Task<bool> DeleteConfigurationAsync(int id)
    {
        var configuration = await _dbContext.Configurations.FindAsync(id);
        if (configuration == null)
            return false;

        _dbContext.Configurations.Remove(configuration);
        await _dbContext.SaveChangesAsync();

        return true;
    }
}
