using System;
using System.IO;
using System.Threading.Tasks;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System.IO.Compression;
using DreamMF.RemoteOrchestration.Core.Interfaces;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.Extensions.Logging;

namespace DreamMF.RemoteOrchestration.Core.Providers;

public class AzureBlobStorageProvider : IStorageProvider
{
    private readonly string _connectionString;
    private readonly string _containerName;
    private readonly ILogger _logger;

    public AzureBlobStorageProvider(
        string connectionString,
        string containerName,
        ILogger logger)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        _containerName = containerName ?? throw new ArgumentNullException(nameof(containerName));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<string> UploadZipAsync(string name, string version, Stream zipContent)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be null or empty.", nameof(name));
        if (string.IsNullOrWhiteSpace(version))
            throw new ArgumentException("Version cannot be null or empty.", nameof(version));
        if (zipContent == null)
            throw new ArgumentNullException(nameof(zipContent));

        var targetPath = $"{name}/{version}";
        var blobServiceClient = new BlobServiceClient(_connectionString);
        var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);

        try
        {
            // Ensure container exists
            await containerClient.CreateIfNotExistsAsync();

            using var memoryStream = new MemoryStream();
            await zipContent.CopyToAsync(memoryStream);
            memoryStream.Position = 0;
            
            using var archive = new ZipArchive(memoryStream, ZipArchiveMode.Read);

            foreach (var entry in archive.Entries)
            {
                // Skip entries related to macOS or dotfiles that should be ignored
                if (entry.FullName.StartsWith("__MACOSX/") || 
                    entry.Name.StartsWith("._") || 
                    string.IsNullOrEmpty(entry.Name) ||
                    entry.Name.Equals(".gitkeep"))
                {
                    continue;
                }

                var adjustedFullName = AdjustPathIgnoringTopLevel(entry.FullName);
                
                try
                {
                    // Create the blob path for this file
                    var blobPath = $"{targetPath}/{adjustedFullName}".Replace("\\", "/");
                    var blobClient = containerClient.GetBlobClient(blobPath);
                    
                    using (var entryStream = entry.Open())
                    using (var ms = new MemoryStream())
                    {
                        await entryStream.CopyToAsync(ms);
                        ms.Position = 0;
                        await blobClient.UploadAsync(ms, true);
                        _logger.LogInformation("Successfully uploaded file to Azure Blob: {Path}", blobPath);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading entry to Azure Blob: {Entry}", entry.FullName);
                    throw new HandledException(ExceptionType.Service, 
                        "Failed to upload file to Azure Blob Storage. Please check your connection string and permissions.");
                }
            }

            // Get the blob service URL
            var blobServiceUrl = blobServiceClient.Uri.ToString().TrimEnd('/');
            return $"{blobServiceUrl}/{_containerName}/{targetPath}/remoteEntry.js";
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
            _logger.LogError(ex, "Failed to upload files to Azure Blob: {Path}", targetPath);
            throw new HandledException(ExceptionType.Service, 
                "Failed to upload files to Azure Blob Storage. Please check your connection string and permissions.");
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
