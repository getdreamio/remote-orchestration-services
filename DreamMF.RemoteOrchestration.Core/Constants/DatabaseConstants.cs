namespace DreamMF.RemoteOrchestration.Core.Constants;

public static class DatabaseConstants
{
    public static class StorageConfig
    {
        // Storage Type Configuration
        public const string STORAGE_TYPE = "storage:type";
        public const string STORAGE_TYPE_LOCAL = "LocalStorage";
        public const string STORAGE_TYPE_AZURE = "AzureBlobStorage";
        public const string STORAGE_TYPE_AWS = "AwsS3Bucket";

        // Azure Configuration Keys
        public const string AZURE_CONTAINER = "storage:azure:container_name";
        public const string AZURE_CONNECTION = "storage:azure:connection_string";

        // AWS Configuration Keys
        public const string AWS_BUCKET_NAME = "storage:aws:bucket_name";
        public const string AWS_BUCKET_REGION = "storage:aws:bucket_region";
        public const string AWS_BUCKET_KEY = "storage:aws:bucket_key";
        public const string AWS_BUCKET_SECRET = "storage:aws:bucket_secret";
    }
}
