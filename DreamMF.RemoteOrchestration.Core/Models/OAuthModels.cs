namespace DreamMF.RemoteOrchestration.Core.Models;

public record OAuthProviderInfo
{
    public required string Name { get; init; }
    public required string DisplayName { get; init; }
    public required string AuthorizationEndpoint { get; init; }
    public required string ClientId { get; init; }
    public required string Scope { get; init; }
    public required Dictionary<string, string> AdditionalParameters { get; init; }
}

public record TokenResponse
{
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public string? IdToken { get; set; }
    public string? TokenType { get; set; }
    public int ExpiresIn { get; set; }
}

public record UserInfo
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
}

public record GitHubEmail
{
    public required string Email { get; set; }
    public bool Primary { get; set; }
    public bool Verified { get; set; }
    public string? Visibility { get; set; }
}

public record AuthResult(bool Success, string? Token, string Message);
