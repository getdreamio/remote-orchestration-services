using System.Text.Json;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class OAuthRoutes
{
    private const string GroupName = "OAuth";

    public static void MapOAuthRoutes(this WebApplication app)
    {
        app.MapGroup("/api/oauth")
           .MapOAuthApi();
    }

    private static RouteGroupBuilder MapOAuthApi(this RouteGroupBuilder group)
    {
        group.MapGet("/providers", GetProviders)
            .WithTags(GroupName)
            .Produces<List<OAuthProviderInfo>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(StatusCodes.Status500InternalServerError)
            .WithMetadata(new EndpointNameMetadata("GetOAuthProviders"))
            .WithSummary("Get OAuth Providers")
            .WithDescription("Returns a list of configured OAuth providers");

        group.MapGet("/enabled-providers", GetEnabledProviders)
            .WithTags(GroupName)
            .Produces<Dictionary<string, bool>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(StatusCodes.Status500InternalServerError)
            .WithMetadata(new EndpointNameMetadata("GetEnabledOAuthProviders"))
            .WithSummary("Get Enabled OAuth Providers")
            .WithDescription("Returns a dictionary of enabled OAuth providers");

        group.MapGet("/login/{provider}", InitiateLogin)
            .WithTags(GroupName)
            .Produces(StatusCodes.Status302Found)
            .Produces<HandledResponseModel>(StatusCodes.Status400BadRequest)
            .Produces<HandledResponseModel>(StatusCodes.Status500InternalServerError)
            .WithMetadata(new EndpointNameMetadata("InitiateOAuthLogin"))
            .WithSummary("Initiate OAuth Login")
            .WithDescription("Redirects the user to the OAuth provider's authorization page");

        group.MapPost("/callback", HandleCallback)
            .WithTags(GroupName)
            .Produces(StatusCodes.Status302Found)
            .Produces<HandledResponseModel>(StatusCodes.Status400BadRequest)
            .Produces<HandledResponseModel>(StatusCodes.Status500InternalServerError)
            .WithMetadata(new EndpointNameMetadata("HandleOAuthCallback"))
            .WithSummary("Handle OAuth Callback")
            .WithDescription("Processes the OAuth callback and returns a JWT token");

        return group;
    }

    private static IResult GetProviders(IOAuthService oauthService)
    {
        try
        {
            var providers = oauthService.GetConfiguredProviders();
            return Results.Ok(providers);
        }
        catch
        {
            return Results.Problem(
                detail: "Error getting OAuth providers",
                statusCode: StatusCodes.Status500InternalServerError,
                title: "OAuth Provider Error"
            );
        }
    }

    private static IResult GetEnabledProviders(IConfiguration configuration)
    {
        try
        {
            var enabledProviders = new Dictionary<string, bool>
            {
                ["google"] = configuration.GetValue<bool>("OAuth:Google:Enabled", false),
                ["github"] = configuration.GetValue<bool>("OAuth:GitHub:Enabled", false),
                ["microsoft"] = configuration.GetValue<bool>("OAuth:Microsoft:Enabled", false)
            };
            
            return Results.Ok(enabledProviders);
        }
        catch
        {
            return Results.Problem(
                detail: "Error getting enabled OAuth providers",
                statusCode: StatusCodes.Status500InternalServerError,
                title: "OAuth Provider Error"
            );
        }
    }

    private static IResult InitiateLogin(string provider, IOAuthService oauthService, HttpContext context)
    {
        try
        {
            var providers = oauthService.GetConfiguredProviders();
            var providerInfo = providers.FirstOrDefault(p => p.Name.Equals(provider, StringComparison.OrdinalIgnoreCase));
            
            if (providerInfo == null)
            {
                return Results.BadRequest(new HandledResponseModel(
                    new List<HandledException> { new HandledException(ExceptionType.Validation, $"Provider '{provider}' is not configured") }));
            }
            
            // Build the authorization URL
            var redirectUri = $"{context.Request.Scheme}://{context.Request.Host}/api/oauth/callback";
            var authorizationUrl = $"{providerInfo.AuthorizationEndpoint}?client_id={providerInfo.ClientId}&redirect_uri={Uri.EscapeDataString(redirectUri)}&scope={Uri.EscapeDataString(providerInfo.Scope)}";
            
            // Add additional parameters
            foreach (var param in providerInfo.AdditionalParameters)
            {
                authorizationUrl += $"&{param.Key}={Uri.EscapeDataString(param.Value)}";
            }
            
            // Add state parameter for security (can be enhanced with CSRF protection)
            var state = Guid.NewGuid().ToString();
            authorizationUrl += $"&state={state}";
            
            // Store state in session or cookie for validation upon callback
            
            return Results.Redirect(authorizationUrl);
        }
        catch
        {
            return Results.Problem(
                detail: "Error initiating OAuth login flow",
                statusCode: StatusCodes.Status500InternalServerError,
                title: "OAuth Login Error"
            );
        }
    }

    private static async Task<IResult> HandleCallback(OAuthCallbackRequest request, IOAuthService oauthService, HttpContext context, IConfiguration configuration)
    {
        try
        {
            // Validate request
            var validationErrors = new List<HandledException>();
            
            if (string.IsNullOrEmpty(request.Provider))
                validationErrors.Add(new HandledException(ExceptionType.Validation, "Provider is required"));
                
            if (string.IsNullOrEmpty(request.Code))
                validationErrors.Add(new HandledException(ExceptionType.Validation, "Authorization code is required"));
            
            if (validationErrors.Count > 0)
                return Results.BadRequest(new HandledResponseModel(validationErrors));

            var redirectUri = request.RedirectUri ?? $"{context.Request.Scheme}://{context.Request.Host}/api/oauth/callback";
            
            var result = await oauthService.HandleCallbackAsync(
                request.Provider,
                request.Code,
                redirectUri);

            if (!result.Success)
            {
                return Results.BadRequest(new HandledResponseModel(
                    new List<HandledException> { new HandledException(ExceptionType.Authentication, result.Message ?? "OAuth authentication failed") }));
            }

            // Get frontend URL for redirect
            var frontendUrl = context.Request.Headers["Referer"].ToString();
            if (string.IsNullOrEmpty(frontendUrl))
            {
                frontendUrl = context.Request.Headers["Origin"].ToString();
            }
            
            // If we still don't have a frontend URL, use a default
            if (string.IsNullOrEmpty(frontendUrl))
            {
                frontendUrl = configuration["Frontend:Url"] ?? "http://localhost:3000";
            }
            
            // Ensure the URL doesn't end with a slash
            frontendUrl = frontendUrl.TrimEnd('/');
            
            // Redirect to the callback page with the token
            return Results.Redirect($"{frontendUrl}/auth/callback?token={result.Token}");
        }
        catch
        {
            return Results.Problem(
                detail: "Error processing OAuth callback",
                statusCode: StatusCodes.Status500InternalServerError,
                title: "OAuth Callback Error"
            );
        }
    }
}

public record OAuthCallbackRequest
{
    public required string Provider { get; init; }
    public required string Code { get; init; }
    public string? RedirectUri { get; init; }
}
