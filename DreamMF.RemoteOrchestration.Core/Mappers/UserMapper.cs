using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;

namespace DreamMF.RemoteOrchestration.Core.Mappers;

public static class UserMapper
{
    public static UserResponse ToResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureUrl = null,
            AuthProvider = user.AuthProvider,
            Status = user.Status,
            LastLoginDate = user.LastLoginDate,
            CreatedDate = user.CreatedDate,
            UpdatedDate = user.UpdatedDate,
            Roles = user.UserRoleMappings?.Select(ur => ur.Role.Name).ToList() ?? new List<string>()
        };
    }

    public static UserRoleResponse ToResponse(UserRole role)
    {
        return new UserRoleResponse
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description ?? string.Empty,
            CreatedDate = role.CreatedDate,
            UpdatedDate = role.UpdatedDate
        };
    }
}
