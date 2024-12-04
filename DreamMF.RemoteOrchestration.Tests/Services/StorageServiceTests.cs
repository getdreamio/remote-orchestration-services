using DreamMF.RemoteOrchestration.Core.Providers;
using Xunit;
using Moq;
using Microsoft.Extensions.Configuration;
using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Database;

namespace DreamMF.RemoteOrchestration.Tests
{
    public class StorageServiceTests
    {
        private readonly Mock<IAzureBlobStorageProvider> _azureBlobStorageProviderMock;
        private readonly Mock<S3StorageProvider> _s3StorageProviderMock;
        private readonly Mock<IConfiguration> _configurationMock;
        private readonly StorageService _storageService;

        public StorageServiceTests()
        {
            _azureBlobStorageProviderMock = new Mock<IAzureBlobStorageProvider>();
            _s3StorageProviderMock = new Mock<S3StorageProvider>();
            _configurationMock = new Mock<IConfiguration>();
            _configurationMock.Setup(config => config["StorageType"]).Returns("Azure");
            _storageService = new StorageService(
                _azureBlobStorageProviderMock.Object,
                _s3StorageProviderMock.Object,
                _configurationMock.Object
            );
        }

        [Fact]
        public void Test_StorageService_MethodName_Should_BehaveAsExpected()
        {
            // Arrange
            // Setup mock behavior

            // Act
            // Call method on _storageService

            // Assert
            // Verify expected behavior
        }
    }
}
