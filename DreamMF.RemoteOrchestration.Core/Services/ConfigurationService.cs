using System.Data.SQLite;
using DreamMF.RemoteOrchestration.Core.Models;
using Microsoft.Extensions.Configuration;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IConfigurationService
{
    Task<List<ConfigurationResponse>> GetAllConfigurationsAsync();
    Task<ConfigurationResponse?> GetConfigurationByKeyAsync(string key);
    Task<ConfigurationResponse> CreateConfigurationAsync(ConfigurationRequest request);
    Task<ConfigurationResponse?> UpdateConfigurationAsync(string key, string value);
}

public class ConfigurationService : IConfigurationService
{
    private readonly string _connectionString;

    public ConfigurationService(IConfiguration configuration)
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

    public async Task<ConfigurationResponse> CreateConfigurationAsync(ConfigurationRequest request)
    {
        using var connection = CreateConnection();
        using var command = new SQLiteCommand(
            @"INSERT INTO Configurations (Key, Value, Created_Date, Updated_Date) 
              VALUES (@Key, @Value, @CreatedDate, @UpdatedDate);
              SELECT last_insert_rowid();",
            connection);

        var now = DateTime.UtcNow;
        command.Parameters.AddWithValue("@Key", request.Key);
        command.Parameters.AddWithValue("@Value", request.Value);
        command.Parameters.AddWithValue("@CreatedDate", now);
        command.Parameters.AddWithValue("@UpdatedDate", now);

        var id = Convert.ToInt32(await command.ExecuteScalarAsync());

        return new ConfigurationResponse
        {
            Id = id,
            Key = request.Key,
            Value = request.Value,
            Created_Date = now,
            Updated_Date = now
        };
    }

    public async Task<ConfigurationResponse?> UpdateConfigurationAsync(string key, string value)
    {
        using var connection = CreateConnection();
        using var command = new SQLiteCommand(
            @"UPDATE Configurations 
              SET Value = @Value, Updated_Date = @UpdatedDate 
              WHERE Key = @Key",
            connection);

        var now = DateTime.UtcNow;
        command.Parameters.AddWithValue("@Key", key);
        command.Parameters.AddWithValue("@Value", value);
        command.Parameters.AddWithValue("@UpdatedDate", now);

        var rowsAffected = await command.ExecuteNonQueryAsync();
        if (rowsAffected > 0)
        {
            return await GetConfigurationByKeyAsync(key);
        }

        return null;
    }
}
