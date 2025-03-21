using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DreamMF.RemoteOrchestration.Core.Services;

public class OAuthService : IOAuthService
{
    private readonly IConfiguration _configuration;
    private readonly IAuthenticationService _authService;
    private readonly IUserService _userService;
    private readonly ILogger<OAuthService> _logger;
    private readonly HttpClient _httpClient;

    public OAuthService(
        IConfiguration configuration,
        IAuthenticationService authService,
        IUserService userService,
        ILogger<OAuthService> logger,
        HttpClient httpClient)
    {
        _configuration = configuration;
        _authService = authService;
        _userService = userService;
        _logger = logger;
        _httpClient = httpClient;
    }

    public List<OAuthProviderInfo> GetConfiguredProviders()
    {
        var providers = new List<OAuthProviderInfo>();
        
        // Google
        var googleClientId = _configuration["OAuth:Google:ClientId"];
        if (!string.IsNullOrEmpty(googleClientId))
        {
            providers.Add(new OAuthProviderInfo
            {
                Name = "google",
                DisplayName = "Google",
                AuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth",
                ClientId = googleClientId,
                Scope = "openid email profile",
                AdditionalParameters = new Dictionary<string, string>
                {
                    ["response_type"] = "code",
                    ["access_type"] = "offline",
                    ["prompt"] = "consent"
                }
            });
        }
        
        // GitHub
        var githubClientId = _configuration["OAuth:GitHub:ClientId"];
        if (!string.IsNullOrEmpty(githubClientId))
        {
            providers.Add(new OAuthProviderInfo
            {
                Name = "github",
                DisplayName = "GitHub",
                AuthorizationEndpoint = "https://github.com/login/oauth/authorize",
                ClientId = githubClientId,
                Scope = "user:email read:user",
                AdditionalParameters = new Dictionary<string, string>()
            });
        }
        
        // Microsoft
        var microsoftClientId = _configuration["OAuth:Microsoft:ClientId"];
        if (!string.IsNullOrEmpty(microsoftClientId))
        {
            providers.Add(new OAuthProviderInfo
            {
                Name = "microsoft",
                DisplayName = "Microsoft",
                AuthorizationEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
                ClientId = microsoftClientId,
                Scope = "openid email profile User.Read",
                AdditionalParameters = new Dictionary<string, string>
                {
                    ["response_type"] = "code",
                    ["response_mode"] = "query"
                }
            });
        }
        
        return providers;
    }

    public async Task<AuthResult> HandleCallbackAsync(string provider, string code, string redirectUri)
    {
        try
        {
            // Normalize provider name
            provider = provider.ToLowerInvariant();
            
            // Exchange authorization code for tokens
            var tokenResponse = await ExchangeCodeForTokensAsync(provider, code, redirectUri);
            if (tokenResponse == null)
            {
                return new AuthResult(false, null, $"Failed to exchange authorization code for tokens with {provider}");
            }
            
            // Get user info from the provider
            var userInfo = await GetUserInfoAsync(provider, tokenResponse.AccessToken ?? string.Empty);
            if (userInfo == null)
            {
                return new AuthResult(false, null, $"Failed to get user info from {provider}");
            }
            
            // Map provider to AuthProvider enum
            var authProvider = provider switch
            {
                "google" => AuthProvider.Google,
                "github" => AuthProvider.GitHub,
                "microsoft" => AuthProvider.Microsoft,
                _ => throw new ArgumentException($"Unsupported provider: {provider}")
            };
            
            // Find or create user
            var user = await _userService.FindOrCreateExternalUserAsync(
                userInfo.Email,
                userInfo.Name,
                authProvider,
                userInfo.Id,
                tokenResponse.AccessToken ?? string.Empty);
            
            // Generate JWT token
            var token = _authService.GenerateJwtToken(user);
            
            return new AuthResult(true, token, "Authentication successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling OAuth callback for provider {Provider}", provider);
            return new AuthResult(false, null, $"Authentication failed: {ex.Message}");
        }
    }

    private async Task<TokenResponse?> ExchangeCodeForTokensAsync(string provider, string code, string redirectUri)
    {
        try
        {
            string tokenEndpoint;
            Dictionary<string, string> parameters = new();
            
            // Configure token request based on provider
            switch (provider)
            {
                case "google":
                    tokenEndpoint = "https://oauth2.googleapis.com/token";
                    parameters["client_id"] = _configuration["OAuth:Google:ClientId"] ?? string.Empty;
                    parameters["client_secret"] = _configuration["OAuth:Google:ClientSecret"] ?? string.Empty;
                    parameters["grant_type"] = "authorization_code";
                    parameters["code"] = code;
                    parameters["redirect_uri"] = redirectUri;
                    break;
                
                case "github":
                    tokenEndpoint = "https://github.com/login/oauth/access_token";
                    parameters["client_id"] = _configuration["OAuth:GitHub:ClientId"] ?? string.Empty;
                    parameters["client_secret"] = _configuration["OAuth:GitHub:ClientSecret"] ?? string.Empty;
                    parameters["code"] = code;
                    parameters["redirect_uri"] = redirectUri;
                    break;
                
                case "microsoft":
                    tokenEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
                    parameters["client_id"] = _configuration["OAuth:Microsoft:ClientId"] ?? string.Empty;
                    parameters["client_secret"] = _configuration["OAuth:Microsoft:ClientSecret"] ?? string.Empty;
                    parameters["grant_type"] = "authorization_code";
                    parameters["code"] = code;
                    parameters["redirect_uri"] = redirectUri;
                    break;
                
                default:
                    throw new ArgumentException($"Unsupported provider: {provider}");
            }
            
            // Create form content
            var content = new FormUrlEncodedContent(parameters);
            
            // Set accept header for GitHub
            if (provider == "github")
            {
                _httpClient.DefaultRequestHeaders.Accept.Clear();
                _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            }
            
            // Send request
            var response = await _httpClient.PostAsync(tokenEndpoint, content);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Token exchange failed. Status: {Status}, Response: {Response}", 
                    response.StatusCode, errorContent);
                return null;
            }
            
            // Parse response
            var responseContent = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            
            return tokenResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exchanging code for tokens with provider {Provider}", provider);
            return null;
        }
    }

    private async Task<UserInfo?> GetUserInfoAsync(string provider, string accessToken)
    {
        try
        {
            string userInfoEndpoint;
            
            // Configure user info request based on provider
            switch (provider)
            {
                case "google":
                    userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
                    break;
                
                case "github":
                    userInfoEndpoint = "https://api.github.com/user";
                    break;
                
                case "microsoft":
                    userInfoEndpoint = "https://graph.microsoft.com/v1.0/me";
                    break;
                
                default:
                    throw new ArgumentException($"Unsupported provider: {provider}");
            }
            
            // Set authorization header
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            
            // Set User-Agent for GitHub
            if (provider == "github")
            {
                _httpClient.DefaultRequestHeaders.UserAgent.Clear();
                _httpClient.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("DreamMF", "1.0"));
            }
            
            // Send request
            var response = await _httpClient.GetAsync(userInfoEndpoint);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("User info request failed. Status: {Status}, Response: {Response}", 
                    response.StatusCode, errorContent);
                return null;
            }
            
            // Parse response
            var responseContent = await response.Content.ReadAsStringAsync();
            var userInfo = JsonDocument.Parse(responseContent).RootElement;
            
            // Extract user info based on provider
            string id, email, name;
            
            switch (provider)
            {
                case "google":
                    id = userInfo.GetProperty("sub").GetString() ?? string.Empty;
                    email = userInfo.GetProperty("email").GetString() ?? string.Empty;
                    name = userInfo.GetProperty("name").GetString() ?? string.Empty;
                    break;
                
                case "github":
                    id = userInfo.GetProperty("id").ToString();
                    
                    // GitHub doesn't always return email in the user info
                    // We might need to make a separate request to get emails
                    if (userInfo.TryGetProperty("email", out var emailProp) && !string.IsNullOrEmpty(emailProp.GetString()))
                    {
                        email = emailProp.GetString() ?? string.Empty;
                    }
                    else
                    {
                        // Get user emails
                        var emailsResponse = await _httpClient.GetAsync("https://api.github.com/user/emails");
                        if (emailsResponse.IsSuccessStatusCode)
                        {
                            var emailsContent = await emailsResponse.Content.ReadAsStringAsync();
                            var emails = JsonSerializer.Deserialize<List<GitHubEmail>>(emailsContent, new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            });
                            
                            // Get primary email
                            var primaryEmail = emails?.FirstOrDefault(e => e.Primary)?.Email;
                            email = primaryEmail ?? emails?.FirstOrDefault()?.Email ?? $"{id}@github.com";
                        }
                        else
                        {
                            email = $"{id}@github.com";
                        }
                    }
                    
                    name = userInfo.GetProperty("name").GetString() ?? userInfo.GetProperty("login").GetString() ?? "GitHub User";
                    break;
                
                case "microsoft":
                    id = userInfo.GetProperty("id").GetString() ?? string.Empty;
                    email = userInfo.GetProperty("userPrincipalName").GetString() ?? string.Empty;
                    name = userInfo.GetProperty("displayName").GetString() ?? string.Empty;
                    break;
                
                default:
                    throw new ArgumentException($"Unsupported provider: {provider}");
            }
            
            return new UserInfo
            {
                Id = id,
                Email = email,
                Name = name
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user info from provider {Provider}", provider);
            return null;
        }
    }
}

public class TokenResponse
{
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public string? IdToken { get; set; }
    public string? TokenType { get; set; }
    public int ExpiresIn { get; set; }
}

public class UserInfo
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
}

public class GitHubEmail
{
    public required string Email { get; set; }
    public bool Primary { get; set; }
    public bool Verified { get; set; }
    public string? Visibility { get; set; }
}
