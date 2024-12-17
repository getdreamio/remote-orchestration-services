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

    public RemoteOrchestrationDbContext(DbContextOptions<RemoteOrchestrationDbContext> options) : base(options)
    {
        EnsureDatabaseCreated();
    }

    private void EnsureDatabaseCreated()
    {
        Database.Migrate();
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlite("Data Source=remote_orchestration.db");
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Host>(entity =>
        {
            entity.HasKey(e => e.Host_ID);
            entity.ToTable("Host");
        });

        modelBuilder.Entity<Remote>(entity =>
        {
            entity.HasKey(e => e.Remote_ID);
            entity.ToTable("Remote");
        });

        modelBuilder.Entity<Configuration>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("Configuration");
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Tag_ID);
            entity.ToTable("Tag");
        });

        modelBuilder.Entity<Tags_Remote>(entity =>
        {
            entity.HasKey(e => e.Tag_Remote_ID);
            entity.ToTable("Tags_Remote");
        });

        modelBuilder.Entity<Tags_Host>(entity =>
        {
            entity.HasKey(e => e.Tag_Host_ID);
            entity.ToTable("Tags_Host");
        });

        modelBuilder.Entity<Host_Remote>(entity =>
        {
            entity.HasKey(e => e.Host_Remote_ID);
            entity.ToTable("Host_Remote");
        });

        modelBuilder.Entity<Audit_Remote>(entity =>
        {
            entity.HasKey(e => e.Audit_ID);
            entity.ToTable("Audit_Remote");
        });

        modelBuilder.Entity<Audit_Host>(entity =>
        {
            entity.HasKey(e => e.Audit_ID);
            entity.ToTable("Audit_Host");
        });

        base.OnModelCreating(modelBuilder);
    }
}
