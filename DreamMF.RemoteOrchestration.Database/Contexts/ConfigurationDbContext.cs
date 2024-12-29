using Microsoft.EntityFrameworkCore;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Database;

public interface IConfigurationDbContext
{
    DbSet<Configuration> Configurations { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public class ConfigurationDbContext : DbContext, IConfigurationDbContext
{
    public DbSet<Configuration> Configurations { get; set; } = null!;

    public ConfigurationDbContext(DbContextOptions<ConfigurationDbContext> options)
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
            Console.WriteLine($"Error ensuring configuration database is created: {ex.Message}");
            throw;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Configuration>(entity =>
        {
            entity.HasKey(e => e.Configuration_ID);
            entity.Property(e => e.Configuration_ID).ValueGeneratedOnAdd();
            entity.Property(e => e.Key).IsRequired();
            entity.Property(e => e.Value).IsRequired();
            entity.Property(e => e.Created_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Updated_Date).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.ToTable("Configuration");
        });

        base.OnModelCreating(modelBuilder);
    }
}
