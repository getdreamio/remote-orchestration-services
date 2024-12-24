using System.Data.SQLite;
using DreamMF.RemoteOrchestration.Core.Models;
using Microsoft.Extensions.Configuration;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IRootConfigurationService
{
    Task<List<ConfigurationResponse>> GetAllConfigurationsAsync();
    Task<ConfigurationResponse?> GetConfigurationByKeyAsync(string key);
}

public class RootConfigurationService : IRootConfigurationService
{
    private readonly string _connectionString;

    public RootConfigurationService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=remote_orchestration.db";
    }

    private SQLiteConnection CreateConnection()
    {
        var connection = new SQLiteConnection(_connectionString);
        connection.Open();
        return connection;
    }

    public async Task<List<ConfigurationResponse>> GetAllConfigurationsAsync()
    {
        using var connection = CreateConnection();
        using var command = new SQLiteCommand(
            "SELECT Configuration_ID, Key, Value, Created_Date, Updated_Date FROM Configurations",
            connection);

        var configurations = new List<ConfigurationResponse>();
        using var reader = await command.ExecuteReaderAsync();
        
        while (await reader.ReadAsync())
        {
            configurations.Add(new ConfigurationResponse
            {
                Id = reader.GetInt32(0),
                Key = reader.GetString(1),
                Value = reader.GetString(2),
                Created_Date = reader.GetDateTime(3),
                Updated_Date = reader.GetDateTime(4)
            });
        }

        return configurations;
    }

    public async Task<ConfigurationResponse?> GetConfigurationByKeyAsync(string key)
    {
        using var connection = CreateConnection();
        using var command = new SQLiteCommand(
            "SELECT Configuration_ID, Key, Value, Created_Date, Updated_Date FROM Configurations WHERE Key = @Key",
            connection);
        
        command.Parameters.AddWithValue("@Key", key);

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new ConfigurationResponse
            {
                Id = reader.GetInt32(0),
                Key = reader.GetString(1),
                Value = reader.GetString(2),
                Created_Date = reader.GetDateTime(3),
                Updated_Date = reader.GetDateTime(4)
            };
        }

        return null;
    }
}
