using System;
using System.IO;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using System.IO.Compression;
using Amazon;
using DreamMF.RemoteOrchestration.Core.Interfaces;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.Extensions.Logging;

namespace DreamMF.RemoteOrchestration.Core.Providers;

public class S3StorageProvider : IStorageProvider
{
    private readonly string _bucketName;
    private readonly string _s3ClientRegion;
    private readonly string _accessKeyId;
    private readonly string _secretAccessKey;
    private readonly ILogger _logger;

    public S3StorageProvider(
        string bucketName, 
        string s3ClientRegion, 
        string accessKeyId, 
        string secretAccessKey,
        ILogger logger)
    {
        _bucketName = bucketName ?? throw new ArgumentNullException(nameof(bucketName));
        _s3ClientRegion = s3ClientRegion ?? throw new ArgumentNullException(nameof(s3ClientRegion));
        _accessKeyId = accessKeyId ?? throw new ArgumentNullException(nameof(accessKeyId));
        _secretAccessKey = secretAccessKey ?? throw new ArgumentNullException(nameof(secretAccessKey));
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

        try
        {
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
                    // Create the S3 key for this file
                    var s3Key = $"{targetPath}/{adjustedFullName}".Replace("\\", "/");
                    
                    using (var entryStream = entry.Open())
                    using (var ms = new MemoryStream())
                    {
                        await entryStream.CopyToAsync(ms);
                        ms.Position = 0;

                        await UploadFileAsync(s3Key, ms);
                        _logger.LogInformation("Successfully uploaded file to S3: {Key}", s3Key);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading entry to S3: {Entry}", entry.FullName);
                    throw new HandledException(ExceptionType.Service, 
                        "Failed to upload file to S3. Please check your AWS credentials and permissions.");
                }
            }

            // Return the S3 URL to the target folder
            return $"https://{_bucketName}.s3.{_s3ClientRegion}.amazonaws.com/{targetPath}/remoteEntry.js";
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
            _logger.LogError(ex, "Failed to upload files to S3: {Path}", targetPath);
            throw new HandledException(ExceptionType.Service, 
                "Failed to upload files to S3. Please check your AWS credentials and permissions.");
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

    private async Task UploadFileAsync(string s3FilePath, Stream fileStream)
    {
        var s3Client = new AmazonS3Client(_accessKeyId, _secretAccessKey, RegionEndpoint.GetBySystemName(_s3ClientRegion));
        
        using (fileStream) // Ensure the stream is disposed
        {
            var putRequest = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = s3FilePath,
                InputStream = fileStream
            };

            await s3Client.PutObjectAsync(putRequest);
        }
    }
}