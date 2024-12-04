using Microsoft.EntityFrameworkCore;
using Moq;
using DreamMF.RemoteOrchestration.Database;

namespace DreamMF.RemoteOrchestration.Tests
{
    public static class MockDbContext 
    {
        public static Mock<T> CreateDbContextMock<T>() where T : DbContext
        {
            var dbContextMock = new Mock<T>();
            // Setup DbSet properties here
            // Example: dbContextMock.Setup(db => db.YourDbSet).Returns(MockDbSet.CreateDbSetMock().Object);

            return dbContextMock;
        }

        public static Mock<DbSet<TEntity>> CreateDbSetMock<TEntity>(IQueryable<TEntity> entities) where TEntity : class
        {
            var dbSetMock = new Mock<DbSet<TEntity>>();
            dbSetMock.As<IQueryable<TEntity>>().Setup(m => m.Provider).Returns(entities.Provider);
            dbSetMock.As<IQueryable<TEntity>>().Setup(m => m.Expression).Returns(entities.Expression);
            dbSetMock.As<IQueryable<TEntity>>().Setup(m => m.ElementType).Returns(entities.ElementType);
            dbSetMock.As<IQueryable<TEntity>>().Setup(m => m.GetEnumerator()).Returns(entities.GetEnumerator());

            return dbSetMock;
        }

        public static Mock<IRemoteOrchestrationDbContext> CreateRemoteOrchestrationDbContextMock()
        {
            var dbContextMock = new Mock<IRemoteOrchestrationDbContext>();
            // Setup DbSet properties here
            // Example: dbContextMock.Setup(db => db.Hosts).Returns(MockDbSet.CreateDbSetMock().Object);

            return dbContextMock;
        }
    }
}
