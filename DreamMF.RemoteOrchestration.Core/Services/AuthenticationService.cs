using System.Security.Claims;
using System.Text;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Database.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using BCrypt.Net;

namespace DreamMF.RemoteOrchestration.Core.Services;

public interface IAuthenticationService
{
    Task<AuthResult> LoginAsync(string email, string password);
    Task<AuthResult> RegisterAsync(string email, string password);
    Task<bool> ValidateTokenAsync(string token);
    string GenerateJwtToken(User user);
}

public record AuthResult(bool Success, string? Token, string Message);

public class AuthenticationService : IAuthenticationService
{
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;

    public AuthenticationService(IUserService userService, IConfiguration configuration)
    {
        _userService = userService;
        _configuration = configuration;
    }

    public async Task<AuthResult> LoginAsync(string email, string password)
    {
        var salt = BCrypt.Net.BCrypt.GenerateSalt();
        Console.WriteLine($"#PasswordSalt: {salt}");
        Console.WriteLine($"#PasswordHash: {BCrypt.Net.BCrypt.HashPassword(password, salt)}");

        var user = await _userService.GetUserObjectByEmailAsync(email);
        if (user == null)
            return new AuthResult(false, null, "Invalid credentials");

        if (user.AuthProvider != AuthProvider.Local)
            return new AuthResult(false, null, "Please use the appropriate authentication provider");

        if (string.IsNullOrEmpty(user.PasswordHash))
            return new AuthResult(false, null, "Invalid credentials");

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return new AuthResult(false, null, "Invalid credentials");

        var token = GenerateJwtToken(user);
        return new AuthResult(true, token, "Login successful");
    }

    public async Task<AuthResult> RegisterAsync(string email, string password)
    {
        var existingUser = await _userService.GetUserByEmailAsync(email);
        if (existingUser != null)
            return new AuthResult(false, null, "User already exists");

        var request = new CreateUserRequest
        {
            Email = email,
            DisplayName = email.Split('@')[0],
            AuthProvider = AuthProvider.Local,
            AuthUserId = Guid.NewGuid().ToString(),
            Password = password
        };

        await _userService.CreateUserAsync(request);
        
        return new AuthResult(true, null, "Registration successful");
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        if (string.IsNullOrEmpty(token))
            return false;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured"));

        try
        {
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return true;
        }
        catch
        {
            return false;
        }
    }

    public string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured"));

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim("auth_provider", user.AuthProvider.ToString())
        };

        if (!string.IsNullOrEmpty(user.FirstName))
            claims.Add(new Claim(ClaimTypes.GivenName, user.FirstName));
        
        if (!string.IsNullOrEmpty(user.LastName))
            claims.Add(new Claim(ClaimTypes.Surname, user.LastName));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"]
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
