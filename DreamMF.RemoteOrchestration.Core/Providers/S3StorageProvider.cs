using Amazon.S3;
using Amazon.S3.Model;

namespace DreamMF.RemoteOrchestration.Core.Providers;

public class S3StorageProvider
{
    private readonly IAmazonS3 _s3Client;

    public S3StorageProvider(IAmazonS3 s3Client)
    {
        _s3Client = s3Client;
    }

    public async Task UploadAsync(string bucketName, string key, Stream content)
    {
        var putRequest = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = key,
            InputStream = content
        };
        await _s3Client.PutObjectAsync(putRequest);
    }

    public async Task<Stream> DownloadAsync(string bucketName, string key)
    {
        var getRequest = new GetObjectRequest
        {
            BucketName = bucketName,
            Key = key
        };
        var response = await _s3Client.GetObjectAsync(getRequest);
        return response.ResponseStream;
    }

    public async Task DeleteAsync(string bucketName, string key)
    {
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = bucketName,
            Key = key
        };
        await _s3Client.DeleteObjectAsync(deleteRequest);
    }
}
