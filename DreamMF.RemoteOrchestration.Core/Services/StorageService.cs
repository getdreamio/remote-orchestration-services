using Microsoft.Extensions.Configuration;
using DreamMF.RemoteOrchestration.Core.Providers;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using DreamMF.RemoteOrchestration.Core.Interfaces;
using DreamMF.RemoteOrchestration.Database;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using DreamMF.RemoteOrchestration.Core.Constants;
using static DreamMF.RemoteOrchestration.Core.Constants.DatabaseConstants.StorageConfig;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class StorageService
{
    // Storage Type Configuration
    // Azure Configuration Keys
    // AWS Configuration Keys

    private readonly IStorageProvider _storageProvider;
    private readonly ILogger _logger;

    public StorageService(
        IConfigurationDbContext configDbContext, 
        IRemoteOrchestrationDbContext remoteDbContext,
        IWebHostEnvironment environment,
        ILogger logger)
    {
        _logger = logger;
        _storageProvider = CreateStorageProvider(configDbContext, remoteDbContext, environment);
    }

    private IStorageProvider CreateStorageProvider(
        IConfigurationDbContext configDbContext,
        IRemoteOrchestrationDbContext remoteDbContext,
        IWebHostEnvironment environment)
    {
        var storageTypeConfig = configDbContext.Configurations
            .FirstOrDefault(c => c.Key == STORAGE_TYPE);

        if (storageTypeConfig == null)
        {
            throw new HandledException(ExceptionType.Validation, 
                "Storage type configuration not found");
        }

        _logger.LogInformation($"Creating storage provider of type: {storageTypeConfig.Value}");

        return storageTypeConfig.Value switch
        {
            STORAGE_TYPE_LOCAL => new LocalStorageProvider(
                configDbContext, 
                remoteDbContext, 
                _logger,
                environment),
            
            STORAGE_TYPE_AZURE => CreateAzureBlobStorageProvider(configDbContext),
            
            STORAGE_TYPE_AWS => CreateS3StorageProvider(configDbContext),
            
            _ => throw new HandledException(ExceptionType.Validation, 
                $"Unsupported storage type: {storageTypeConfig.Value}")
        };
    }

    private AzureBlobStorageProvider CreateAzureBlobStorageProvider(IConfigurationDbContext dbContext)
    {
        var connectionString = GetConfigValue(dbContext, AZURE_CONNECTION);
        var containerName = GetConfigValue(dbContext, AZURE_CONTAINER);

        return new AzureBlobStorageProvider(connectionString, containerName, _logger);
    }

    private S3StorageProvider CreateS3StorageProvider(IConfigurationDbContext dbContext)
    {
        var bucketName = GetConfigValue(dbContext, AWS_BUCKET_NAME);
        var bucketRegion = GetConfigValue(dbContext, AWS_BUCKET_REGION);
        var bucketKey = GetConfigValue(dbContext, AWS_BUCKET_KEY);
        var bucketSecret = GetConfigValue(dbContext, AWS_BUCKET_SECRET);

        return new S3StorageProvider(bucketName, bucketRegion, bucketKey, bucketSecret, _logger);
    }

    private string GetConfigValue(IConfigurationDbContext dbContext, string key)
    {
        var config = dbContext.Configurations.FirstOrDefault(c => c.Key == key);
        if (config == null || string.IsNullOrEmpty(config.Value))
        {
            throw new HandledException(ExceptionType.Validation, 
                $"Configuration value not found or empty for key: {key}");
        }
        return config.Value;
    }

    public async Task<string> UploadAsync(string name, string version, Stream content)
    {
        try
        {
            return await _storageProvider.UploadZipAsync(name, version, content);
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Service, 
                $"Failed to upload content: {ex.Message}");
        }
    }
}
