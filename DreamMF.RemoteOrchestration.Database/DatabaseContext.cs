using Microsoft.EntityFrameworkCore;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace DreamMF.RemoteOrchestration.Database;

public interface IRemoteOrchestrationDbContext
{
    DatabaseFacade Database { get; }
    DbSet<T> Set<T>() where T : class;
    DbSet<Host> Hosts { get; set; }
    DbSet<Remote> Remotes { get; set; }
    DbSet<Configuration> Configurations { get; set; }
    DbSet<Tag> Tags { get; set; }
    DbSet<Module> Modules { get; set; }
    DbSet<Tags_Remote> Tags_Remotes { get; set; }
    DbSet<Tags_Host> Tags_Hosts { get; set; }
    DbSet<Host_Remote> Host_Remotes { get; set; }
    DbSet<RemoteModule> RemoteModules { get; set; }
    DbSet<AuditReads_Host> AuditReads_Hosts { get; set; }
    DbSet<AuditReads_Remote> AuditReads_Remotes { get; set; }
    DbSet<EntityAnalytics> EntityAnalytics { get; set; }
    DbSet<DailyEntityAnalytics> DailyEntityAnalytics { get; set; }
    DbSet<RecentRemoteAnalytics> RecentRemoteAnalytics { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public class RemoteOrchestrationDbContext : DbContext, IRemoteOrchestrationDbContext
{
    public DbSet<Host> Hosts { get; set; } = null!;
    public DbSet<Remote> Remotes { get; set; } = null!;
    public DbSet<Configuration> Configurations { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<Module> Modules { get; set; } = null!;
    public DbSet<Tags_Remote> Tags_Remotes { get; set; } = null!;
    public DbSet<Tags_Host> Tags_Hosts { get; set; } = null!;
    public DbSet<Host_Remote> Host_Remotes { get; set; } = null!;
    public DbSet<RemoteModule> RemoteModules { get; set; } = null!;
    public DbSet<AuditReads_Host> AuditReads_Hosts { get; set; } = null!;
    public DbSet<AuditReads_Remote> AuditReads_Remotes { get; set; } = null!;
    public DbSet<EntityAnalytics> EntityAnalytics { get; set; } = null!;
    public DbSet<DailyEntityAnalytics> DailyEntityAnalytics { get; set; } = null!;
    public DbSet<RecentRemoteAnalytics> RecentRemoteAnalytics { get; set; } = null!;

    public new DatabaseFacade Database => base.Database;

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

    public override DbSet<T> Set<T>() where T : class
    {
        return base.Set<T>();
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
            entity.HasKey(e => e.Configuration_ID);
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

        modelBuilder.Entity<Module>(entity =>
        {
            entity.HasKey(e => e.Module_ID);
            entity.ToTable("Module");
        });

        modelBuilder.Entity<RemoteModule>(entity =>
        {
            entity.HasKey(e => e.Remote_Module_ID);
            entity.ToTable("Remote_Module");
        });

        modelBuilder.Entity<RemoteModule>()
            .HasOne(rm => rm.Remote)
            .WithMany(r => r.RemoteModules)
            .HasForeignKey(rm => rm.Remote_ID);

        modelBuilder.Entity<AuditReads_Host>(entity =>
        {
            entity.HasKey(e => e.AuditRead_ID);
            entity.ToTable("AuditReads_Host");
        });

        modelBuilder.Entity<AuditReads_Remote>(entity =>
        {
            entity.HasKey(e => e.AuditRead_ID);
            entity.ToTable("AuditReads_Remote");
        });

        modelBuilder.Entity<EntityAnalytics>()
            .HasNoKey()
            .ToView("v_HostReadAnalytics");

        modelBuilder.Entity<DailyEntityAnalytics>()
            .HasNoKey()
            .ToView("v_DailyHostReads");

        modelBuilder.Entity<DailyEntityAnalytics>()
            .HasNoKey()
            .ToView("v_DailyRemoteReads");

        modelBuilder.Entity<RecentRemoteAnalytics>()
            .HasNoKey()
            .ToView("v_RecentRemoteAnalytics");

        base.OnModelCreating(modelBuilder);
    }
}
