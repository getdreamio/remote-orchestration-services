using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Data.Sqlite;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using DreamMF.RemoteOrchestration.Database;
using Microsoft.Extensions.DependencyInjection;
using System.Data.Common;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IBackupService
{
    Task<(byte[] FileContent, string FileName)> GetDatabaseBackupAsync();
    Task RestoreDatabaseAsync(IFormFile file);
}

public class BackupService : IBackupService
{
    private readonly ILogger<BackupService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly string _databasePath;

    public BackupService(ILogger<BackupService> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IRemoteOrchestrationDbContext>();
        _databasePath = dbContext.Database.GetDbConnection().DataSource;
    }

    private async Task ForceCloseAllConnectionsAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var services = scope.ServiceProvider.GetServices<IRemoteOrchestrationDbContext>();
        
        foreach (var service in services)
        {
            if (service is DbContext context)
            {
                context.ChangeTracker.Clear();
                var connection = context.Database.GetDbConnection();
                if (connection.State == System.Data.ConnectionState.Open)
                {
                    await connection.CloseAsync();
                }
            }
        }

        // Force GC to clean up any lingering connections
        GC.Collect();
        GC.WaitForPendingFinalizers();
    }

    public async Task<(byte[] FileContent, string FileName)> GetDatabaseBackupAsync()
    {
        if (!File.Exists(_databasePath))
        {
            throw new HandledException(ExceptionType.Database, "Database file not found");
        }

        try
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<IRemoteOrchestrationDbContext>();
                var connection = dbContext.Database.GetDbConnection();
                if (connection.State == System.Data.ConnectionState.Open)
                {
                    await connection.CloseAsync();
                }
            }
            var bytes = await File.ReadAllBytesAsync(_databasePath);
            return (bytes, "remote_orchestration_backup.db");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading database file for backup");
            throw new HandledException(ExceptionType.Database,"Error creating database backup", ex);
        }
    }

    public async Task RestoreDatabaseAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new HandledException(ExceptionType.Validation, "No file was uploaded");
        }

        var tempPath = Path.GetTempFileName();
        var backupPath = $"{_databasePath}.backup_{DateTime.UtcNow:yyyyMMddHHmmss}";

        try
        {
            // Save uploaded file
            await using (var stream = new FileStream(tempPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Verify SQLite database
            try
            {
                await using var tempConnection = new SqliteConnection($"Data Source={tempPath};Mode=ReadOnly;Cache=Shared;Pooling=False");
                await tempConnection.OpenAsync();
                await tempConnection.CloseAsync();
            }
            catch (Exception ex)
            {
                throw new HandledException(ExceptionType.Validation, "The uploaded file is not a valid SQLite database", ex);
            }

            // Create backup
            if (File.Exists(_databasePath))
            {
                File.Copy(_databasePath, backupPath, true);
                _logger.LogInformation("Created database backup at {BackupPath}", backupPath);
            }

            // Close all connections and clear contexts
            await ForceCloseAllConnectionsAsync();

            // Replace database file
            File.Copy(tempPath, _databasePath, true);
            _logger.LogInformation("Database file replaced successfully");

            // Initialize with new connection
            using (var scope = _serviceProvider.CreateScope())
            {
                var newContext = scope.ServiceProvider.GetRequiredService<IRemoteOrchestrationDbContext>();
                
                // Ensure database is created and schema is up to date
                await newContext.Database.EnsureCreatedAsync();
                
                // Force a new connection
                var connection = newContext.Database.GetDbConnection();
                if (connection.State != System.Data.ConnectionState.Open)
                {
                    await connection.OpenAsync();
                }
                
                // Verify we can read data
                if (newContext is DbContext context)
                {
                    // Try to access some data to verify connection
                    await context.Database.ExecuteSqlRawAsync("SELECT 1");
                }
            }

            _logger.LogInformation("Database restored and verified successfully");

            // Clean up temp files
            if (File.Exists(backupPath))
            {
                File.Delete(backupPath);
                _logger.LogInformation("Cleaned up backup file");
            }

            if (File.Exists(tempPath))
            {
                File.Delete(tempPath);
                _logger.LogInformation("Cleaned up temp file");
            }

            // Force another connection reset
            await ForceCloseAllConnectionsAsync();
        }
        catch (Exception ex)
        {
            // Try to restore from backup if something went wrong
            if (File.Exists(backupPath) && File.Exists(_databasePath))
            {
                await ForceCloseAllConnectionsAsync();
                File.Copy(backupPath, _databasePath, true);
                _logger.LogWarning("Restored from backup after error");
            }

            throw new HandledException(ExceptionType.Service, $"Failed to restore database: {ex.Message}");
        }
    }
}
