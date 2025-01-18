using BCrypt.Net;
using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IUserService
{
    Task<List<UserResponse>> GetAllUsersAsync();
    Task<UserResponse?> GetUserByIdAsync(int id);
    Task<UserResponse?> GetUserByEmailAsync(string email);
    Task<UserResponse> CreateUserAsync(CreateUserRequest request);
    Task<UserResponse> UpdateUserAsync(int id, UpdateUserRequest request);
    Task DeleteUserAsync(int id);
    Task<bool> VerifyEmailAsync(string email, string token);
    Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    Task<List<string>> GetUserRolesAsync(int userId);
    Task<bool> AddUserToRoleAsync(int userId, string roleName);
    Task<bool> RemoveUserFromRoleAsync(int userId, string roleName);
}

public class UserService : IUserService
{
    private readonly IRemoteOrchestrationDbContext _dbContext;

    public UserService(IRemoteOrchestrationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<UserResponse>> GetAllUsersAsync()
    {
        var users = await _dbContext.Users
            .Include(u => u.UserRoleMappings)
                .ThenInclude(ur => ur.Role)
            .ToListAsync();

        return users.Select(u => UserMapper.ToResponse(u)).ToList();
    }

    public async Task<UserResponse?> GetUserByIdAsync(int id)
    {
        var user = await _dbContext.Users
            .Include(u => u.UserRoleMappings)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        return user != null ? UserMapper.ToResponse(user) : null;
    }

    public async Task<UserResponse?> GetUserByEmailAsync(string email)
    {
        var user = await _dbContext.Users
            .Include(u => u.UserRoleMappings)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

        return user != null ? UserMapper.ToResponse(user) : null;
    }

    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request)
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var user = new User
        {
            Email = request.Email,
            DisplayName = request.DisplayName,
            FirstName = request.FirstName,
            LastName = request.LastName,
            AuthProvider = request.AuthProvider,
            AuthUserId = request.AuthUserId ?? Guid.NewGuid().ToString(),
            Status = UserStatus.Active,
            CreatedDate = now,
            UpdatedDate = now
        };

        if (request.AuthProvider == AuthProvider.Local && !string.IsNullOrEmpty(request.Password))
        {
            var salt = BCrypt.Net.BCrypt.GenerateSalt();
            user.PasswordSalt = salt;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, salt);
        }
        else
        {
            user.AccessToken = request.AccessToken;
            user.RefreshToken = request.RefreshToken;
            user.TokenExpiry = request.AccessToken != null ? DateTimeOffset.UtcNow.AddDays(30).ToUnixTimeSeconds() : null;
        }

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return UserMapper.ToResponse(user);
    }

    public async Task<UserResponse> UpdateUserAsync(int id, UpdateUserRequest request)
    {
        var user = await _dbContext.Users.FindAsync(id);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        if (request.DisplayName != null)
            user.DisplayName = request.DisplayName;
        if (request.FirstName != null)
            user.FirstName = request.FirstName;
        if (request.LastName != null)
            user.LastName = request.LastName;
        if (request.Status.HasValue)
            user.Status = request.Status.Value;
        if (request.IsTwoFactorEnabled.HasValue)
            user.IsTwoFactorEnabled = request.IsTwoFactorEnabled.Value;

        if (!string.IsNullOrEmpty(request.CurrentPassword) && !string.IsNullOrEmpty(request.NewPassword))
        {
            if (user.PasswordHash == null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                throw new InvalidOperationException("Current password is incorrect");

            var salt = BCrypt.Net.BCrypt.GenerateSalt();
            user.PasswordSalt = salt;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, salt);
        }

        user.UpdatedDate = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        await _dbContext.SaveChangesAsync();
        return UserMapper.ToResponse(user);
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _dbContext.Users.FindAsync(id);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<bool> VerifyEmailAsync(string email, string token)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => 
            u.Email.ToLower() == email.ToLower() && 
            u.EmailVerificationToken == token &&
            u.EmailVerificationTokenExpiry > DateTimeOffset.UtcNow.ToUnixTimeSeconds());

        if (user == null)
            return false;

        user.IsEmailVerified = true;
        user.Status = UserStatus.Active;
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiry = null;
        user.UpdatedDate = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => 
            u.Email.ToLower() == email.ToLower() && 
            u.EmailVerificationToken == token &&
            u.EmailVerificationTokenExpiry > DateTimeOffset.UtcNow.ToUnixTimeSeconds());

        if (user == null)
            return false;

        var salt = BCrypt.Net.BCrypt.GenerateSalt();
        user.PasswordSalt = salt;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword, salt);
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiry = null;
        user.UpdatedDate = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<List<string>> GetUserRolesAsync(int userId)
    {
        var user = await _dbContext.Users
            .Include(u => u.UserRoleMappings)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");

        return user.UserRoleMappings.Select(ur => ur.Role.Name).ToList();
    }

    public async Task<bool> AddUserToRoleAsync(int userId, string roleName)
    {
        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");

        var role = await _dbContext.UserRoles.FirstOrDefaultAsync(r => 
            r.Name.ToUpper() == roleName.ToUpper());
        if (role == null)
            throw new KeyNotFoundException($"Role {roleName} not found");

        var existingMapping = await _dbContext.UserRoleMappings
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == role.Id);
        if (existingMapping != null)
            return false;

        var mapping = new UserRoleMapping
        {
            UserId = userId,
            RoleId = role.Id,
            CreatedDate = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        };

        _dbContext.UserRoleMappings.Add(mapping);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveUserFromRoleAsync(int userId, string roleName)
    {
        var mapping = await _dbContext.UserRoleMappings
            .Include(ur => ur.Role)
            .FirstOrDefaultAsync(ur => 
                ur.UserId == userId && 
                ur.Role.Name.ToUpper() == roleName.ToUpper());

        if (mapping == null)
            return false;

        _dbContext.UserRoleMappings.Remove(mapping);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
