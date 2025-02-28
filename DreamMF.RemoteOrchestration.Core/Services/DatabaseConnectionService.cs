using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Npgsql;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IDatabaseConnectionService
{
    Task<bool> TestConnectionAsync(string databaseType, string connectionString);
    Task<string> BuildConnectionStringAsync(string databaseType, string host, string port, string database, string username, string password, string filename);
}

public class DatabaseConnectionService : IDatabaseConnectionService
{
    public async Task<bool> TestConnectionAsync(string databaseType, string connectionString)
    {
        if (string.IsNullOrEmpty(connectionString))
            return false;

        try
        {
            DbConnection connection = databaseType.ToLowerInvariant() switch
            {
                "sqlserver" => new SqlConnection(connectionString),
                "postgresql" => new NpgsqlConnection(connectionString),
                "mysql" => new MySqlConnection(connectionString),
                "sqlite" => new Microsoft.Data.Sqlite.SqliteConnection(connectionString),
                _ => throw new ArgumentException($"Unsupported database type: {databaseType}")
            };

            await using (connection)
            {
                await connection.OpenAsync();
                return true;
            }
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.WriteLine($"Error testing database connection: {ex.Message}");
            return false;
        }
    }

    public Task<string> BuildConnectionStringAsync(string databaseType, string host, string port, string database, string username, string password, string filename)
    {
        string connectionString = databaseType.ToLowerInvariant() switch
        {
            "sqlserver" => $"Server={host},{port};Database={database};User Id={username};Password={password};TrustServerCertificate=True;",
            "postgresql" => $"Host={host};Port={port};Database={database};Username={username};Password={password};",
            "mysql" => $"Server={host};Port={port};Database={database};User={username};Password={password};",
            "sqlite" => $"Data Source={filename}",
            _ => throw new ArgumentException($"Unsupported database type: {databaseType}")
        };

        return Task.FromResult(connectionString);
    }
}
