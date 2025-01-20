using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;
using Microsoft.EntityFrameworkCore;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class UserRoutes
{
    private const string GroupName = "Users";

    public static void MapUserRoutes(this WebApplication app)
    {
        app.MapGroup("/api/users")
           .MapUsersApi();
    }

    private static RouteGroupBuilder MapUsersApi(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetUsers)
            .WithTags(GroupName)
            .Produces<List<UserResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List all users"))
            .WithSummary("Get All Users")
            .WithDescription("Retrieves a list of all registered users");

        group.MapGet("/{id}", GetUser)
            .WithTags(GroupName)
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get user by ID"))
            .WithSummary("Get User by ID")
            .WithDescription("Retrieves a specific user by their unique identifier");

        group.MapPost("/", CreateUser)
            .WithTags(GroupName)
            .Produces<UserResponse>(StatusCodes.Status201Created)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Create a new user"))
            .WithSummary("Create a New User")
            .WithDescription("Creates a new user with the provided details");

        group.MapPut("/{id}", UpdateUser)
            .WithTags(GroupName)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Update an existing user"))
            .WithSummary("Update User")
            .WithDescription("Updates an existing user's details");

        group.MapDelete("/{id}", DeleteUser)
            .WithTags(GroupName)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Delete a user"))
            .WithSummary("Delete User")
            .WithDescription("Deletes a user by their unique identifier");

        group.MapGet("/{id}/roles", GetUserRoles)
            .WithTags(GroupName)
            .Produces<List<string>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get user roles"))
            .WithSummary("Get User Roles")
            .WithDescription("Retrieves all roles assigned to a specific user");

        group.MapPost("/{id}/roles/{roleId}", AddUserRole)
            .WithTags(GroupName)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Add role to user"))
            .WithSummary("Add Role to User")
            .WithDescription("Assigns a role to a specific user");

        group.MapDelete("/{id}/roles/{roleId}", RemoveUserRole)
            .WithTags(GroupName)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Remove role from user"))
            .WithSummary("Remove Role from User")
            .WithDescription("Removes a role from a specific user");

        return group;
    }

    private static async Task<IResult> GetUsers(IUserService userService)
    {
        // Create the method in UserService and fill in the logic
        var users = await userService.GetAllUsersAsync();
        return Results.Ok(users);
    }

    private static async Task<IResult> GetUser(int id, IUserService userService)
    {
        var user = await userService.GetUserByIdAsync(id);
        if (user == null)
            return Results.NotFound();
        return Results.Ok(user);
    }

    private static async Task<IResult> CreateUser(CreateUserRequest request, IUserService userService)
    {
        // Use a mapper here from requesdt to user
        var user = await userService.CreateUserAsync(request);
        return Results.Created($"/api/users/{user.Id}", user);
    }

    private static async Task<IResult> UpdateUser(int id, UpdateUserRequest request, IUserService userService)
    {
        // Use a mapper here from requesdt to user
        var user = await userService.UpdateUserAsync(id, request);
        return Results.NoContent();
    }

    private static async Task<IResult> DeleteUser(int id, IUserService userService)
    {
        await userService.DeleteUserAsync(id);
        return Results.NoContent();
    }

    private static async Task<IResult> GetUserRoles(int id, IUserService userService)
    {
        var roles = await userService.GetUserRolesAsync(id);
        return Results.Ok(roles);
    }

    private static async Task<IResult> AddUserRole(int id, int roleId, IUserService userService)
    {
        // Create the method in UserService and fill in the logic
        var success = await userService.AddUserRoleAsync(id, roleId);
        if (!success)
            return Results.NotFound();
        return Results.NoContent();
    }

    private static async Task<IResult> RemoveUserRole(int id, int roleId, IUserService userService)
    {
        // Create the method in UserService and fill in the logic
        var success = await userService.RemoveUserRoleAsync(id, roleId);
        if (!success)
            return Results.NotFound();
        return Results.NoContent();
    }
}
