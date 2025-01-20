using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public enum AuthProvider
{
    Local,
    Google,
    GitHub,
    Microsoft,
    Custom
}

public enum UserStatus
{
    Active,
    Inactive,
    Suspended,
    PendingVerification
}

public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    // Basic Info
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string DisplayName { get; set; } = string.Empty;
    
    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    // Authentication
    [Required]
    public AuthProvider AuthProvider { get; set; }
    [Required]
    public string AuthUserId { get; set; } = string.Empty;
    
    // Local Auth specific
    public string? PasswordHash { get; set; }
    public string? PasswordSalt { get; set; }

    // OAuth/SSO specific
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public long? TokenExpiry { get; set; }
    public string? ProviderMetadata { get; set; } // JSON string for additional provider-specific data

    // Status and Security
    [Required]
    public UserStatus Status { get; set; }
    public long? LastLoginDate { get; set; }
    public string? LastLoginIp { get; set; }
    public int FailedLoginAttempts { get; set; }
    public long? LockoutEnd { get; set; }

    // Timestamps
    [Required]
    public long CreatedDate { get; set; }
    [Required]
    public long UpdatedDate { get; set; }

    // Navigation properties
    public virtual ICollection<UserRoleMapping> UserRoleMappings { get; set; } = new List<UserRoleMapping>();
}
