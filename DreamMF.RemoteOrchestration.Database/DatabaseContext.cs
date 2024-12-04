using Microsoft.EntityFrameworkCore;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Database;

public interface IRemoteOrchestrationDbContext
{
    DbSet<Host> Hosts { get; set; }
    DbSet<Remote> Remotes { get; set; }
    DbSet<Configuration> Configurations { get; set; }
    DbSet<Tag> Tags { get; set; }
    DbSet<Tags_Remote> Tags_Remotes { get; set; }
    DbSet<Tags_Host> Tags_Hosts { get; set; }
    DbSet<Host_Remote> Host_Remotes { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public class RemoteOrchestrationDbContext : DbContext, IRemoteOrchestrationDbContext
{
    public DbSet<Host> Hosts { get; set; } = null!;
    public DbSet<Remote> Remotes { get; set; } = null!;
    public DbSet<Configuration> Configurations { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<Tags_Remote> Tags_Remotes { get; set; } = null!;
    public DbSet<Tags_Host> Tags_Hosts { get; set; } = null!;
    public DbSet<Host_Remote> Host_Remotes { get; set; } = null!;

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=remote_orchestration.db");
    }
}
