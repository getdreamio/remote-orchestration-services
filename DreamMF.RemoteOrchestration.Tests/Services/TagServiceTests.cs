using Xunit;
using Moq;
using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Database;

namespace DreamMF.RemoteOrchestration.Tests
{
    public class TagServiceTests
    {
        private readonly Mock<IRemoteOrchestrationDbContext> _dbContextMock;
        private readonly TagService _tagService;

        public TagServiceTests()
        {
            _dbContextMock = MockDbContext.CreateRemoteOrchestrationDbContextMock();
            _tagService = new TagService(_dbContextMock.Object);
        }

        [Fact]
        public void Test_TagService_MethodName_Should_BehaveAsExpected()
        {
            // Arrange
            // Setup mock behavior

            // Act
            // Call method on _tagService

            // Assert
            // Verify expected behavior
        }
    }
}
