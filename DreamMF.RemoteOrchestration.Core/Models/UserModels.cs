using System.ComponentModel.DataAnnotations;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Models;

public class UserResponse
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public AuthProvider AuthProvider { get; set; }
    public bool IsEmailVerified { get; set; }
    public bool IsTwoFactorEnabled { get; set; }
    public UserStatus Status { get; set; }
    public long? LastLoginDate { get; set; }
    public long CreatedDate { get; set; }
    public long UpdatedDate { get; set; }
    public List<string> Roles { get; set; } = new();
}

public class CreateUserRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string DisplayName { get; set; } = string.Empty;

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Password { get; set; }  // Required for local auth
    public AuthProvider AuthProvider { get; set; } = AuthProvider.Local;
    public string? AuthUserId { get; set; }  // Required for OAuth/SSO
    public string? AccessToken { get; set; }  // Required for OAuth/SSO
    public string? RefreshToken { get; set; }  // Optional for OAuth/SSO
}

public class UpdateUserRequest
{
    public string? DisplayName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? NewPassword { get; set; }
    public UserStatus? Status { get; set; }
}

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public long ExpiresAt { get; set; }
    public UserResponse User { get; set; } = null!;
}

public class UserRoleResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public long CreatedDate { get; set; }
    public long UpdatedDate { get; set; }
}

public class AddUserRoleRequest
{
    [Required]
    public int RoleId { get; set; }
}
