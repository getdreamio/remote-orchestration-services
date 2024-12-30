using System.IO.Compression;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using System.Text.RegularExpressions;
using Version = DreamMF.RemoteOrchestration.Database.Entities.Version;

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
    private const string DefaultRemotesFolder = "remotes";
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
        if (!IsValidName(name))
            throw new HandledException(ExceptionType.Validation, 
                "Remote name is invalid. Use only letters, numbers, hyphens, underscores, and periods.");
            
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
                    Created_Date = DateTimeOffset.UtcNow,
                    Updated_Date = DateTimeOffset.UtcNow
                };
                _dbContext.Remotes.Add(remote);
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Save changes result for new remote: {Result}", 1);
                
                _logger.LogInformation("Created new remote with ID: {Id}", remote.Remote_ID);
            }

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
                    Created_Date = DateTimeOffset.UtcNow,
                    Updated_Date = DateTimeOffset.UtcNow
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

            // Now handle the file upload
            string baseStoragePath = await GetStoragePathAsync();
            
            // Ensure base storage path exists
            if (!Directory.Exists(baseStoragePath))
            {
                try
                {
                    Directory.CreateDirectory(baseStoragePath);
                    _logger.LogInformation("Created base storage directory: {Path}", baseStoragePath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to create base storage directory: {Path}", baseStoragePath);
                    throw new HandledException(ExceptionType.Service, 
                        "Unable to create storage directory. Please check application permissions.");
                }
            }

            // Build and validate target path
            var targetPath = Path.GetFullPath(Path.Combine(baseStoragePath, name, version));
            if (!targetPath.StartsWith(baseStoragePath))
            {
                _logger.LogError("Path traversal attempt detected. Target: {Target}, Base: {Base}", targetPath, baseStoragePath);
                throw new HandledException(ExceptionType.Security, "Invalid path detected");
            }

            // Create target directory
            try
            {
                Directory.CreateDirectory(targetPath);
                _logger.LogInformation("Created target directory: {Path}", targetPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create target directory: {Path}", targetPath);
                throw new HandledException(ExceptionType.Service, 
                    "Unable to create target directory. Please check application permissions.");
            }

            // Extract files
            try
            {
                using var memoryStream = new MemoryStream();
                await zipContent.CopyToAsync(memoryStream);
                memoryStream.Position = 0;
                
                using var archive = new ZipArchive(memoryStream, ZipArchiveMode.Read);
                
                // Validate zip contents before extraction
                foreach (var entry in archive.Entries)
                {
                    var fullPath = Path.GetFullPath(Path.Combine(targetPath, entry.FullName));
                    if (!fullPath.StartsWith(targetPath))
                    {
                        _logger.LogError("Zip slip attempt detected. Entry: {Entry}", entry.FullName);
                        throw new HandledException(ExceptionType.Security, 
                            "Invalid zip file: Contains files that would extract outside the target directory");
                    }
                }
                
                // Extract files
                archive.ExtractToDirectory(targetPath, true);
                _logger.LogInformation("Successfully extracted files to: {Path}", targetPath);

                // Update the remote's updated date
                remote.Updated_Date = DateTimeOffset.UtcNow;
                await _dbContext.SaveChangesAsync();
            }
            catch (HandledException)
            {
                throw;
            }
            catch (InvalidDataException ex)
            {
                _logger.LogError(ex, "Invalid zip file");
                throw new HandledException(ExceptionType.Validation, "Invalid zip file format");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to extract files to: {Path}", targetPath);
                throw new HandledException(ExceptionType.Service, 
                    "Failed to extract files. Please check permissions and available disk space.");
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

    private async Task<string> GetStoragePathAsync()
    {
        try
        {
            var configuredPath = await _configurationDbContext.Configurations
                .Where(c => c.Key == "storage:path")
                .Select(c => c.Value)
                .FirstOrDefaultAsync();

            string basePath = _environment.ContentRootPath;
            
            if (!string.IsNullOrEmpty(configuredPath))
            {
                // If configured path is relative, combine with content root
                if (!Path.IsPathRooted(configuredPath))
                {
                    return Path.GetFullPath(Path.Combine(basePath, configuredPath));
                }
                
                // If configured path is absolute, validate it's under content root
                var fullConfigPath = Path.GetFullPath(configuredPath);
                if (!fullConfigPath.StartsWith(basePath))
                {
                    _logger.LogWarning("Configured storage path is outside content root. Using default path.");
                    return Path.GetFullPath(Path.Combine(basePath, DefaultRemotesFolder));
                }
                return fullConfigPath;
            }
            
            return Path.GetFullPath(Path.Combine(basePath, DefaultRemotesFolder));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get storage path from configuration");
            return Path.GetFullPath(Path.Combine(_environment.ContentRootPath, DefaultRemotesFolder));
        }
    }
}
