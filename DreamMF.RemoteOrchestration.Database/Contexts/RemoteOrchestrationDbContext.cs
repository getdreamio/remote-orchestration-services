using Microsoft.EntityFrameworkCore;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace DreamMF.RemoteOrchestration.Database;

public interface IRemoteOrchestrationDbContext
{
    DatabaseFacade Database { get; }
    DbSet<T> Set<T>() where T : class;
    EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class;
    DbSet<Host> Hosts { get; set; }
    DbSet<Remote> Remotes { get; set; }
    DbSet<Tag> Tags { get; set; }
    DbSet<Module> Modules { get; set; }
    DbSet<Tags_Remote> Tags_Remotes { get; set; }
    DbSet<Tags_Host> Tags_Hosts { get; set; }
    DbSet<Host_Remote> Host_Remotes { get; set; }
    DbSet<RemoteModule> RemoteModules { get; set; }
    DbSet<AuditReads_Host> AuditReads_Hosts { get; set; }
    DbSet<AuditReads_Remote> AuditReads_Remotes { get; set; }
    DbSet<AuditRemote> AuditRemotes { get; set; }
    DbSet<EntityAnalytics> EntityAnalytics { get; set; }
    DbSet<DailyEntityAnalytics> DailyEntityAnalytics { get; set; }
    DbSet<RecentRemoteAnalytics> RecentRemoteAnalytics { get; set; }
    DbSet<Entities.Version> Versions { get; set; }
    DbSet<User> Users { get; set; }
    DbSet<UserRole> UserRoles { get; set; }
    DbSet<UserRoleMapping> UserRoleMappings { get; set; }
    DbSet<SearchResult> SearchResults { get; set; }
    DbSet<HostVariable> HostVariables { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public class RemoteOrchestrationDbContext : DbContext, IRemoteOrchestrationDbContext
{
    public DbSet<Host> Hosts { get; set; } = null!;
    public DbSet<Remote> Remotes { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<Module> Modules { get; set; } = null!;
    public DbSet<Tags_Remote> Tags_Remotes { get; set; } = null!;
    public DbSet<Tags_Host> Tags_Hosts { get; set; } = null!;
    public DbSet<Host_Remote> Host_Remotes { get; set; } = null!;
    public DbSet<RemoteModule> RemoteModules { get; set; } = null!;
    public DbSet<AuditReads_Host> AuditReads_Hosts { get; set; } = null!;
    public DbSet<AuditReads_Remote> AuditReads_Remotes { get; set; } = null!;
    public DbSet<AuditRemote> AuditRemotes { get; set; } = null!;
    public DbSet<EntityAnalytics> EntityAnalytics { get; set; } = null!;
    public DbSet<DailyEntityAnalytics> DailyEntityAnalytics { get; set; } = null!;
    public DbSet<RecentRemoteAnalytics> RecentRemoteAnalytics { get; set; } = null!;
    public DbSet<Entities.Version> Versions { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<UserRole> UserRoles { get; set; } = null!;
    public DbSet<UserRoleMapping> UserRoleMappings { get; set; } = null!;
    public DbSet<SearchResult> SearchResults { get; set; } = null!;
    public DbSet<HostVariable> HostVariables { get; set; } = null!;

    public new DatabaseFacade Database => base.Database;

    public EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class
    {
        return base.Entry(entity);
    }

    public RemoteOrchestrationDbContext(DbContextOptions<RemoteOrchestrationDbContext> options)
        : base(options)
    {
        EnsureDatabaseCreated();
    }

    private void EnsureDatabaseCreated()
    {
        try
        {
            Database.EnsureCreated();
            if (Database.GetPendingMigrations().Any())
            {
                Database.Migrate();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error ensuring database is created: {ex.Message}");
            throw;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Host>(entity =>
        {
            entity.HasKey(e => e.Host_ID);
            entity.Property(e => e.Host_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("Host");
        });

        modelBuilder.Entity<Remote>(entity =>
        {
            entity.HasKey(e => e.Remote_ID);
            entity.Property(e => e.Remote_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("Remote");
        });

        modelBuilder.Entity<Entities.Version>(entity =>
        {
            entity.HasKey(e => e.Version_ID);
            entity.Property(e => e.Version_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Value).IsRequired();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasOne<Remote>()
                .WithMany()
                .HasForeignKey(e => e.Remote_ID)
                .OnDelete(DeleteBehavior.Cascade);
            entity.ToTable("Version");
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Tag_ID);
            entity.Property(e => e.Tag_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Key).IsRequired();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("Tag");
        });

        modelBuilder.Entity<Module>(entity =>
        {
            entity.HasKey(e => e.Module_ID);
            entity.Property(e => e.Module_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("Module");
        });

        modelBuilder.Entity<Tags_Remote>(entity =>
        {
            entity.HasKey(e => e.Tag_Remote_ID);
            entity.Property(e => e.Tag_Remote_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("Tags_Remote");
        });

        modelBuilder.Entity<Tags_Host>(entity =>
        {
            entity.HasKey(e => e.Tag_Host_ID);
            entity.Property(e => e.Tag_Host_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("Tags_Host");
        });

        modelBuilder.Entity<Host_Remote>(entity =>
        {
            entity.HasKey(e => e.Host_Remote_ID);
            entity.Property(e => e.Host_Remote_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("Host_Remote");
        });

        modelBuilder.Entity<RemoteModule>(entity =>
        {
            entity.HasKey(e => e.Remote_Module_ID);
            entity.Property(e => e.Remote_Module_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("Remote_Module");
        });

        modelBuilder.Entity<RemoteModule>()
            .HasOne(rm => rm.Remote)
            .WithMany(r => r.RemoteModules)
            .HasForeignKey(rm => rm.Remote_ID);

        modelBuilder.Entity<AuditReads_Host>(entity =>
        {
            entity.HasKey(e => e.AuditRead_ID);
            entity.Property(e => e.AuditRead_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("AuditReads_Host");
        });

        modelBuilder.Entity<AuditReads_Remote>(entity =>
        {
            entity.HasKey(e => e.AuditRead_ID);
            entity.Property(e => e.AuditRead_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("AuditReads_Remote");
        });

        modelBuilder.Entity<AuditRemote>(entity =>
        {
            entity.HasKey(e => e.Audit_ID);
            entity.Property(e => e.Audit_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Change).IsRequired();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasOne(e => e.Remote)
                .WithMany()
                .HasForeignKey(e => e.Remote_ID);
            entity.ToTable("Audit_Remote");
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

        modelBuilder.Entity<SearchResult>()
            .HasNoKey()
            .ToView("v_SearchResults");

        modelBuilder.Entity<Host>()
            .HasMany(h => h.Tags_Hosts)
            .WithOne(th => th.Host)
            .HasForeignKey(th => th.Host_ID);

        modelBuilder.Entity<Remote>()
            .HasMany(r => r.Tags_Remotes)
            .WithOne(tr => tr.Remote)
            .HasForeignKey(tr => tr.Remote_ID);

        modelBuilder.Entity<Tag>()
            .HasMany(t => t.Tags_Hosts)
            .WithOne(th => th.Tag)
            .HasForeignKey(th => th.Tag_ID);

        modelBuilder.Entity<Tag>()
            .HasMany(t => t.Tags_Remotes)
            .WithOne(tr => tr.Tag)
            .HasForeignKey(tr => tr.Tag_ID);

        modelBuilder.Entity<Host>()
            .HasMany(h => h.Host_Remotes)
            .WithOne(hr => hr.Host)
            .HasForeignKey(hr => hr.Host_ID);

        modelBuilder.Entity<Remote>()
            .HasMany(r => r.Host_Remotes)
            .WithOne(hr => hr.Remote)
            .HasForeignKey(hr => hr.Remote_ID);

        modelBuilder.Entity<Remote>()
            .HasMany(r => r.RemoteModules)
            .WithOne(rm => rm.Remote)
            .HasForeignKey(rm => rm.Remote_ID);

        modelBuilder.Entity<Module>()
            .HasMany(m => m.RemoteModules)
            .WithOne(rm => rm.Module)
            .HasForeignKey(rm => rm.Module_ID);

        modelBuilder.Entity<User>()
            .HasMany(u => u.UserRoleMappings)
            .WithOne(urm => urm.User)
            .HasForeignKey(urm => urm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRole>()
            .HasMany(r => r.UserRoleMappings)
            .WithOne(urm => urm.Role)
            .HasForeignKey(urm => urm.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => new { u.AuthProvider, u.AuthUserId });

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Status);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.LastLoginDate);

        modelBuilder.Entity<UserRole>()
            .HasIndex(r => r.NormalizedName)
            .IsUnique();

        modelBuilder.Entity<User>().ToTable("User");
        modelBuilder.Entity<UserRole>().ToTable("UserRole");
        modelBuilder.Entity<UserRoleMapping>().ToTable("UserRoleMapping");

        modelBuilder.Entity<HostVariable>(entity =>
        {
            entity.HasKey(e => e.HostVariable_ID);
            entity.Property(e => e.HostVariable_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Key).IsRequired();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("HostVariable");
        });

        modelBuilder.Entity<HostVariable>()
            .HasOne(hv => hv.Host)
            .WithMany()
            .HasForeignKey(hv => hv.Host_ID)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }

    public override DbSet<T> Set<T>() where T : class
    {
        return base.Set<T>();
    }
}
