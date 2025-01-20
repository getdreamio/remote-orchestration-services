using DreamMF.RemoteOrchestration.Core.Exceptions;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;
using Microsoft.AspNetCore.Builder;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class AuthRoutes
{
    private const string GroupName = "Authentication";

    public static void MapAuthRoutes(this WebApplication app)
    {
        app.MapGroup("/api/auth")
           .MapAuthApi();
    }

    private static RouteGroupBuilder MapAuthApi(this RouteGroupBuilder group)
    {
        group.MapPost("/login", Login)
            .WithTags(GroupName)
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(401)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Login"))
            .WithSummary("User Login")
            .WithDescription("Authenticates a user and returns a JWT token");

        group.MapPost("/register", Register)
            .WithTags(GroupName)
            .Produces<AuthResponse>(StatusCodes.Status201Created)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Register"))
            .WithSummary("User Registration")
            .WithDescription("Registers a new user account");

        // group.MapPost("/forgot-password", ForgotPassword)
        //     .WithTags(GroupName)
        //     .Produces(StatusCodes.Status200OK)
        //     .Produces<HandledResponseModel>(400)
        //     .Produces<HandledResponseModel>(500)
        //     .WithMetadata(new EndpointNameMetadata("Forgot Password"))
        //     .WithSummary("Forgot Password")
        //     .WithDescription("Initiates the password reset process");

        // group.MapPost("/reset-password", ResetPassword)
        //     .WithTags(GroupName)
        //     .Produces(StatusCodes.Status200OK)
        //     .Produces<HandledResponseModel>(400)
        //     .Produces<HandledResponseModel>(500)
        //     .WithMetadata(new EndpointNameMetadata("Reset Password"))
        //     .WithSummary("Reset Password")
        //     .WithDescription("Resets the user's password using a reset token");

        group.MapPost("/logout", Logout)
            .WithTags(GroupName)
            .Produces(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Logout"))
            .WithSummary("User Logout")
            .WithDescription("Invalidates the current user's session");

        return group;
    }

    private static async Task<IResult> Login(LoginRequest request, IAuthenticationService authService)
    {
        var result = await authService.LoginAsync(request.Email, request.Password);
        if (!result.Success)
            return Results.BadRequest(new HandledResponseModel(result.Message));

        var response = new AuthResponse
        {
            Token = result.Token,
            ExpiresIn = 604800 // 7 days in seconds
        };
        return response != null ? Results.Ok(response) : Results.BadRequest("Unable to log you in.");
    }

    private static async Task<IResult> Register(RegisterRequest request, IAuthenticationService authService)
    {
        if (request.Password != request.ConfirmPassword)
            return Results.BadRequest(new HandledResponseModel("Passwords do not match"));

        var result = await authService.RegisterAsync(request.Email, request.Password);
        if (!result.Success)
            return Results.BadRequest(new HandledResponseModel(result.Message));

        var response = new AuthResponse
        {
            Token = result.Token,
            ExpiresIn = 604800 // 7 days in seconds
        };
        return response != null ? Results.Created("/api/auth/login", response) : Results.BadRequest("Unable to register a new user.");
    }

    private static async Task<IResult> Logout()
    {
        // Since we're using JWT tokens, we don't need server-side logout
        // The client should remove the token from storage
        return Results.Ok();
    }
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string ConfirmPassword);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Token, string NewPassword, string ConfirmPassword);
public record AuthResponse
{
    public string Token { get; init; }
    public int ExpiresIn { get; init; }
}
