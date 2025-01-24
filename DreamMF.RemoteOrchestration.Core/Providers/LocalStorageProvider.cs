using System;
using System.IO;
using System.Threading.Tasks;
using System.IO.Compression;
using Amazon;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore.Query;

namespace DreamMF.RemoteOrchestration.Core.Providers;

public class LocalStorageProvider : IStorageProvider
{
    private readonly IConfigurationDbContext _configurationDbContext;
    private readonly IRemoteOrchestrationDbContext _dbContext;
    private readonly ILogger _logger;
    private readonly IWebHostEnvironment _environment;
    private const string DefaultRemotesFolder = "remotes";
    private static readonly Regex SafeNamePattern = new Regex(@"^[a-zA-Z0-9\-_.]+$", RegexOptions.Compiled);
    

    public LocalStorageProvider(IConfigurationDbContext configurationDbContext, IRemoteOrchestrationDbContext dbContext, ILogger logger, IWebHostEnvironment environment)
    {
        _configurationDbContext = configurationDbContext;
        _dbContext = dbContext;
        _logger = logger;
        _environment = environment;
    }

    public async Task<string> UploadZipAsync(string name, string version, Stream zipContent)
    {
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

                foreach (var entry in archive.Entries)
                {
                    // Skip entries related to macOS or dotfiles that should be ignored
                    if (entry.FullName.StartsWith("__MACOSX/") || entry.Name.StartsWith("._") || entry.Name.Equals("") || entry.Name.Equals(".gitkeep"))
                    {
                        continue;
                    }

                    var adjustedFullName = AdjustPathIgnoringTopLevel(entry.FullName);
                    try
                    {
                        // Compute the full path for the extracted file
                        var fullPath = Path.GetFullPath(Path.Combine(targetPath, adjustedFullName));
                        if (!fullPath.StartsWith(Path.GetFullPath(targetPath), StringComparison.Ordinal))
                        {
                            _logger.LogError("Zip slip attempt detected. Entry: {Entry}", entry.FullName);
                            throw new UnauthorizedAccessException("Invalid zip file: Contains files that would extract outside the target directory.");
                        }
                        
                        if (!string.IsNullOrEmpty(entry.Name))
                        {
                            Directory.CreateDirectory(Path.GetDirectoryName(fullPath));
                            entry.ExtractToFile(fullPath, overwrite: true);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error extracting entry: {Entry}", entry.FullName);
                        throw;
                    }
                }

                _logger.LogInformation("Successfully extracted files to: {Path}", targetPath);
                return await CalculateAndUpdateRemotePath(name, version);
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

    public async Task<string> CalculateAndUpdateRemotePath(string name, string version)
    {
        try
        {
            var dbType = await _configurationDbContext.Configurations
                .Where(c => c.Key == "database:type")
                .Select(c => c.Value)
                .FirstOrDefaultAsync();

            var baseUrl = await _configurationDbContext.Configurations
                .Where(c => c.Key == "api:base_url")
                .Select(c => c.Value)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(baseUrl))
            {
                _logger.LogWarning("Base URL not configured. Using empty base URL.");
                baseUrl = string.Empty;
            }

            baseUrl = baseUrl.TrimEnd('/');

            if (string.Equals(dbType, "sqlite", StringComparison.OrdinalIgnoreCase))
            {
                var storagePath = await GetStoragePathAsync();
                var remotePath = Path.Combine(storagePath, name, version, "remoteEntry.js");
                return $"{baseUrl}/remotes/{name}/{version}/remoteEntry.js";
            }

            _logger.LogWarning("Unknown database type: {DbType}. Using default path pattern.", dbType);
            return $"{baseUrl}/remotes/{name}/{version}/remoteEntry.js";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to calculate remote path");
            throw new HandledException(ExceptionType.Service, "Failed to calculate remote path");
        }
    }

    private string AdjustPathIgnoringTopLevel(string fullName)
    {
        var parts = fullName.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length <= 1) // Root file or no folders
        {
            return fullName;
        }
        return string.Join('/', parts, 1, parts.Length - 1);
    }
}