using System.IO.Compression;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using System.Text.RegularExpressions;
using Version = DreamMF.RemoteOrchestration.Database.Entities.Version;
using DreamMF.RemoteOrchestration.Core.Services;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IUploadService
{
    Task ExtractAndSaveRemoteAsync(string name, string version, string key, string scope, Stream zipContent);
}

public class UploadService : IUploadService
{
    private readonly IConfigurationDbContext _configurationDbContext;
    private readonly IRemoteOrchestrationDbContext _dbContext;
    private readonly ILogger<UploadService> _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly StorageService _storageService;
    private static readonly Regex SafeNamePattern = new Regex(@"^[a-zA-Z0-9\-_.]+$", RegexOptions.Compiled);
    
    public UploadService(
        IConfigurationDbContext configurationDbContext,
        IRemoteOrchestrationDbContext dbContext,
        ILogger<UploadService> logger,
        IWebHostEnvironment environment)
    {
        _configurationDbContext = configurationDbContext;
        _dbContext = dbContext;
        _logger = logger;
        _environment = environment;
        _storageService = new StorageService(configurationDbContext, dbContext, environment, logger);
    }

    private static bool IsValidName(string name)
    {
        return !string.IsNullOrWhiteSpace(name) && 
               SafeNamePattern.IsMatch(name) && 
               !name.Contains("..") &&
               !Path.IsPathRooted(name);
    }
    
    public async Task ExtractAndSaveRemoteAsync(string name, string version, string key, string scope, Stream zipContent)
    {
        // Validate inputs
        
        if (!IsValidName(version))
            throw new HandledException(ExceptionType.Validation, 
                "Version is invalid. Use only letters, numbers, hyphens, underscores, and periods.");
            
        if (string.IsNullOrWhiteSpace(key))
            throw new HandledException(ExceptionType.Validation, "Key is required");
            
        if (string.IsNullOrWhiteSpace(scope))
            throw new HandledException(ExceptionType.Validation, "Scope is required");
            
        if (zipContent == null)
            throw new HandledException(ExceptionType.Validation, "Zip content is required");

        try
        {
            // First, ensure the remote exists in the database or create it
            var remote = await _dbContext.Remotes
                .FirstOrDefaultAsync(r => r.Name == name && r.Key == key && r.Scope == scope);

            if (remote == null)
            {
                remote = new Remote
                {
                    Name = name,
                    Key = key,
                    Scope = scope,
                    Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                };
                _dbContext.Remotes.Add(remote);
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Save changes result for new remote: {Result}", 1);
                
                _logger.LogInformation("Created new remote with ID: {Id}", remote.Remote_ID);
            }

            // Upload the zip using the storage service
            string url = await _storageService.UploadAsync(name, version, zipContent);

            // Update remote with new URL
            remote.Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            remote.Url = url;
            await _dbContext.SaveChangesAsync();

            // Check if version already exists
            Version? existingVersion = null;
            try
            {
                existingVersion = await _dbContext.Versions
                    .FirstOrDefaultAsync(v => v.Remote_ID == remote.Remote_ID && v.Value == version);

                _logger.LogInformation("Existing version found: {Found}", existingVersion != null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error querying version from database");
                throw new HandledException(ExceptionType.Service, "Database query error");
            }

            if (existingVersion == null)
            {
                _logger.LogInformation("Creating new version record for remote ID: {RemoteId}", remote.Remote_ID);
                var versionEntity = new Version
                {
                    Remote_ID = remote.Remote_ID,
                    Value = version,
                    Url = url,
                    Created_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    Updated_Date = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                };

                try 
                {
                    await _dbContext.Versions.AddAsync(versionEntity);
                    await _dbContext.SaveChangesAsync();
                    _logger.LogInformation("Created new version record with ID: {Id}", versionEntity.Version_ID);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error saving version to database. Exception type: {Type}", ex.GetType().Name);
                    throw new HandledException(ExceptionType.Service, $"Failed to save version to database: {ex.Message}");
                }
            }
        }
        catch (HandledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during file extraction");
            throw new HandledException(ExceptionType.Service, "An unexpected error occurred during file extraction");
        }
    }

}
