using System;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.Runtime;

namespace DreamMF.RemoteOrchestration.Core.Providers;

public class S3StorageProvider
{
    private readonly string _bucketName;
    private readonly IAmazonS3 _s3Client;

    public S3StorageProvider(string bucketName, string accessKey, string secretKey, string region = "us-east-1")
    {
        if (string.IsNullOrWhiteSpace(bucketName)) throw new ArgumentException("Bucket name cannot be null or empty.", nameof(bucketName));
        if (string.IsNullOrWhiteSpace(accessKey)) throw new ArgumentException("Access key cannot be null or empty.", nameof(accessKey));
        if (string.IsNullOrWhiteSpace(secretKey)) throw new ArgumentException("Secret key cannot be null or empty.", nameof(secretKey));

        _bucketName = bucketName;

        var credentials = new BasicAWSCredentials(accessKey, secretKey);
        var regionEndpoint = RegionEndpoint.GetBySystemName(region);
        _s3Client = new AmazonS3Client(credentials, regionEndpoint);
    }

    public async Task UploadAsync(string remoteName, string version, Stream content)
    {
        if (string.IsNullOrWhiteSpace(remoteName)) throw new ArgumentException("Remote name cannot be null or empty.", nameof(remoteName));
        if (string.IsNullOrWhiteSpace(version)) throw new ArgumentException("Version cannot be null or empty.", nameof(version));
        if (content == null || !content.CanRead) throw new ArgumentException("Content stream must be readable.", nameof(content));
        var key = $"{remoteName}/{version}";
        try
        {
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = content,
                AutoCloseStream = true // Ensures the stream is closed after the operation
            };
            var response = await _s3Client.PutObjectAsync(request);
            if (response.HttpStatusCode != System.Net.HttpStatusCode.OK)
            {
                throw new Exception($"Failed to upload file to S3. HTTP Status: {response.HttpStatusCode}");
            }
        }
        catch (AmazonS3Exception ex)
        {
            Console.WriteLine($"AWS Error: {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"General Error: {ex.Message}");
            throw;
        }
    }

    public async Task UploadZipAsync(string remoteFolder, Stream zipStream)
    {
        if (string.IsNullOrWhiteSpace(remoteFolder)) throw new ArgumentException("Remote folder cannot be null or empty.", nameof(remoteFolder));
        if (zipStream == null || !zipStream.CanRead) throw new ArgumentException("ZIP stream must be readable.", nameof(zipStream));
        try
        {
            using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Read))
            {
                foreach (var entry in archive.Entries)
                {
                    if (string.IsNullOrWhiteSpace(entry.Name))
                    {
                        // Skip folders in the zip
                        continue;
                    }

                    var key = $"{remoteFolder}/{entry.FullName}";
                    using (var entryStream = entry.Open())
                    {
                        var request = new PutObjectRequest
                        {
                            BucketName = _bucketName,
                            Key = key,
                            InputStream = entryStream,
                            AutoCloseStream = true
                        };
                        var response = await _s3Client.PutObjectAsync(request);
                        if (response.HttpStatusCode != System.Net.HttpStatusCode.OK)
                        {
                            throw new Exception($"Failed to upload file '{entry.FullName}' to S3. HTTP Status: {response.HttpStatusCode}");
                        }
                    }
                }
            }
        }
        catch (AmazonS3Exception ex)
        {
            Console.WriteLine($"AWS Error: {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"General Error: {ex.Message}");
            throw;
        }
    }
}
