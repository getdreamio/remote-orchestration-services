using DreamMF.RemoteOrchestration.Core.Models;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IOAuthService
{
    List<OAuthProviderInfo> GetConfiguredProviders();
    Task<AuthResult> HandleCallbackAsync(string provider, string code, string redirectUri);
}
