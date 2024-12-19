// using DreamMF.RemoteOrchestration.Core.Providers;
// using Xunit;
// using Moq;
// using Microsoft.Extensions.Configuration;
// using DreamMF.RemoteOrchestration.Core.Services;

// namespace DreamMF.RemoteOrchestration.Tests;

// public class StorageServiceTests
// {
//     private readonly Mock<IAzureBlobStorageProvider> _azureBlobStorageProviderMock;
//     private readonly Mock<S3StorageProvider> _s3StorageProviderMock;
//     private readonly Mock<IConfiguration> _configurationMock;
//     private readonly StorageService _storageService;

//     public StorageServiceTests()
//     {
//         _azureBlobStorageProviderMock = new Mock<IAzureBlobStorageProvider>();
//         _s3StorageProviderMock = new Mock<IS3StorageProvider>();
//         _configurationMock = new Mock<IConfiguration>();
//         _configurationMock.Setup(config => config["StorageType"]).Returns("Azure");
//         _storageService = new StorageService(
//             _azureBlobStorageProviderMock.Object,
//             _s3StorageProviderMock.Object,
//             _configurationMock.Object
//         );
//     }

//     [Fact]
//     public async Task UploadFile_WithAzureStorage_ShouldCallAzureProvider()
//     {
//         // Arrange
//         var filePath = "/path/to/file.txt";
//         var container = "testcontainer";
//         var blob = "testblob";
//         _azureBlobStorageProviderMock.Setup(x => x.UploadFileAsync(filePath, container, blob))
//             .ReturnsAsync(true);

//         // Act
//         var result = await _storageService.UploadFileAsync(filePath, container, blob);

//         // Assert
//         Assert.True(result);
//         _azureBlobStorageProviderMock.Verify(x => x.UploadFileAsync(filePath, container, blob), Times.Once);
//         _s3StorageProviderMock.Verify(x => x.UploadFileAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
//     }

//     [Fact]
//     public async Task UploadFile_WithAwsStorage_ShouldCallS3Provider()
//     {
//         // Arrange
//         _configurationMock.Setup(config => config["StorageType"]).Returns("AWS");
//         var filePath = "/path/to/file.txt";
//         var bucket = "testbucket";
//         var key = "testkey";
//         _s3StorageProviderMock.Setup(x => x.UploadFileAsync(filePath, bucket, key))
//             .ReturnsAsync(true);

//         // Act
//         var result = await _storageService.UploadFileAsync(filePath, bucket, key);

//         // Assert
//         Assert.True(result);
//         _s3StorageProviderMock.Verify(x => x.UploadFileAsync(filePath, bucket, key), Times.Once);
//         _azureBlobStorageProviderMock.Verify(x => x.UploadFileAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
//     }

//     [Fact]
//     public async Task ListFiles_WithAzureStorage_ShouldCallAzureProvider()
//     {
//         // Arrange
//         var container = "testcontainer";
//         var prefix = "testprefix";
//         var expectedFiles = new List<string> { "file1.txt", "file2.txt" };
//         _azureBlobStorageProviderMock.Setup(x => x.ListFilesAsync(container, prefix))
//             .ReturnsAsync(expectedFiles);

//         // Act
//         var result = await _storageService.ListFilesAsync(container, prefix);

//         // Assert
//         Assert.Equal(expectedFiles, result);
//         _azureBlobStorageProviderMock.Verify(x => x.ListFilesAsync(container, prefix), Times.Once);
//         _s3StorageProviderMock.Verify(x => x.ListFilesAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
//     }
// }
