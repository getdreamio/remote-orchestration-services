using DreamMF.RemoteOrchestration.Core.Mappers;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.AspNetCore.Mvc.Diagnostics;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IUserService
{
    Task<List<UserResponse>> GetAllUsersAsync();
    Task<UserResponse?> GetUserByIdAsync(int id);
    Task<UserResponse?> GetUserByEmailAsync(string email);
    Task<User?> GetUserObjectByEmailAsync(string email);
    Task<UserResponse?> CreateUserAsync(CreateUserRequest request);
    Task<UserResponse> UpdateUserAsync(int id, UpdateUserRequest request);
    Task<bool> DeleteUserAsync(int id);
    Task<IEnumerable<string>> GetUserRolesAsync(int userId);
    Task<bool> AddUserRoleAsync(int userId, int roleId);
    Task<bool> RemoveUserRoleAsync(int userId, int roleId);
    Task<IEnumerable<string>> GetAvailableRolesAsync();
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

    public async Task<User?> GetUserObjectByEmailAsync(string email)
    {
        var user = await _dbContext.Users
            .Include(u => u.UserRoleMappings)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        return user;
    }

    public async Task<UserResponse?> CreateUserAsync(CreateUserRequest request)
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

        // Update roles
        var existingRoleMappings = await _dbContext.Set<UserRoleMapping>()
            .Where(ur => ur.UserId == id)
            .ToListAsync();
        
        // Remove all existing role mappings
        _dbContext.Set<UserRoleMapping>().RemoveRange(existingRoleMappings);

        // Add new role mappings
        if (request.Roles?.Any() == true)
        {
            var roleEntities = await _dbContext.UserRoles
                .Where(r => request.Roles.Contains(r.Name))
                .ToListAsync();

            var newRoleMappings = roleEntities.Select(r => new UserRoleMapping 
            { 
                UserId = id, 
                RoleId = r.Id 
            });
            
            await _dbContext.Set<UserRoleMapping>().AddRangeAsync(newRoleMappings);
        }

        if (!string.IsNullOrEmpty(request.NewPassword))
        {
            var salt = BCrypt.Net.BCrypt.GenerateSalt();
            user.PasswordSalt = salt;
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, salt);
        }

        user.UpdatedDate = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        await _dbContext.SaveChangesAsync();
        return UserMapper.ToResponse(user);
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _dbContext.Users.FindAsync(id);
        if (user == null)
            return false;

        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<string>> GetUserRolesAsync(int userId)
    {
        var user = await _dbContext.Users
            .Include(u => u.UserRoleMappings)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user?.UserRoleMappings
            .Select(ur => ur.Role.Name)
            .ToList() ?? new List<string>();
    }

    public async Task<bool> AddUserRoleAsync(int userId, int roleId)
    {
        var user = await _dbContext.Users.FindAsync(userId);
        var role = await _dbContext.Set<UserRole>().FindAsync(roleId);

        if (user == null || role == null)
            return false;

        var mapping = new UserRoleMapping
        {
            UserId = userId,
            RoleId = roleId,
            CreatedDate = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        };

        _dbContext.Set<UserRoleMapping>().Add(mapping);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveUserRoleAsync(int userId, int roleId)
    {
        var mapping = await _dbContext.Set<UserRoleMapping>()
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);

        if (mapping == null)
            return false;

        _dbContext.Set<UserRoleMapping>().Remove(mapping);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<string>> GetAvailableRolesAsync()
    {
        var roles = await _dbContext.UserRoles
            .OrderBy(r => r.Name)
            .Select(r => r.Name)
            .ToListAsync();
        
        return roles;
    }
}
