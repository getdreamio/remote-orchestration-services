using Microsoft.Extensions.Configuration;
using DreamMF.RemoteOrchestration.Core.Providers;
using DreamMF.RemoteOrchestration.Core.Exceptions;

namespace DreamMF.RemoteOrchestration.Core.Providers;

public class StorageService
{
    private readonly AzureBlobStorageProvider _azureBlobStorageProvider;
    private readonly S3StorageProvider _s3StorageProvider;
    private readonly string _storageType;

    public StorageService(AzureBlobStorageProvider azureBlobStorageProvider, S3StorageProvider s3StorageProvider, IConfiguration configuration)
    {
        _azureBlobStorageProvider = azureBlobStorageProvider;
        _s3StorageProvider = s3StorageProvider;
        _storageType = configuration["StorageType"] ?? "Azure";
    }

    public async Task UploadAsync(string containerOrBucketName, string blobOrKey, Stream content)
    {
        if (string.IsNullOrWhiteSpace(containerOrBucketName) || string.IsNullOrWhiteSpace(blobOrKey) || content == null)
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        try
        {
            if (_storageType == "Azure")
            {
                await _azureBlobStorageProvider.UploadAsync(containerOrBucketName, blobOrKey, content);
            }
            else if (_storageType == "S3")
            {
                await _s3StorageProvider.UploadAsync(containerOrBucketName, blobOrKey, content);
            }
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Dependency, "Failed to upload file", ex);
        }
    }

    public async Task<Stream> DownloadAsync(string containerOrBucketName, string blobOrKey)
    {
        if (string.IsNullOrWhiteSpace(containerOrBucketName) || string.IsNullOrWhiteSpace(blobOrKey))
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        try
        {
            if (_storageType == "Azure")
            {
                return await _azureBlobStorageProvider.DownloadAsync(containerOrBucketName, blobOrKey);
            }
            else if (_storageType == "S3")
            {
                return await _s3StorageProvider.DownloadAsync(containerOrBucketName, blobOrKey);
            }
            throw new HandledException(ExceptionType.Validation, "Invalid storage type");
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Dependency, "Failed to download file", ex);
        }
    }

    public async Task DeleteAsync(string containerOrBucketName, string blobOrKey)
    {
        if (string.IsNullOrWhiteSpace(containerOrBucketName) || string.IsNullOrWhiteSpace(blobOrKey))
        {
            throw new HandledException(ExceptionType.Validation, "Invalid input parameters.");
        }
        try
        {
            if (_storageType == "Azure")
            {
                await _azureBlobStorageProvider.DeleteAsync(containerOrBucketName, blobOrKey);
            }
            else if (_storageType == "S3")
            {
                await _s3StorageProvider.DeleteAsync(containerOrBucketName, blobOrKey);
            }
        }
        catch (Exception ex)
        {
            throw new HandledException(ExceptionType.Dependency, "Failed to delete file", ex);
        }
    }
}
