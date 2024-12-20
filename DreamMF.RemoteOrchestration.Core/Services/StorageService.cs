using Microsoft.Extensions.Configuration;
using DreamMF.RemoteOrchestration.Core.Providers;
using DreamMF.RemoteOrchestration.Core.Exceptions;

namespace DreamMF.RemoteOrchestration.Core.Providers;

public class StorageService
{
    private readonly IAzureBlobStorageProvider _azureBlobStorageProvider;
    private readonly S3StorageProvider _s3StorageProvider;
    private readonly string _storageType;

    public StorageService(IAzureBlobStorageProvider azureBlobStorageProvider, S3StorageProvider s3StorageProvider, IConfiguration configuration)
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
}
