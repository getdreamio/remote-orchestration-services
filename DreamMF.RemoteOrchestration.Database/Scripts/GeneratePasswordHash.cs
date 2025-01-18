using System;
using System.Security.Cryptography;
using System.Text;

class Program
{
    static void Main()
    {
        string password = "Dr34m!12345";
        
        // Generate a random salt
        byte[] salt = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }
        
        // Generate hash using PBKDF2
        byte[] hash = new byte[32];
        using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256))
        {
            hash = pbkdf2.GetBytes(32);
        }
        
        // Convert to base64 for storage
        string hashBase64 = Convert.ToBase64String(hash);
        string saltBase64 = Convert.ToBase64String(salt);
        
        Console.WriteLine($"Password Hash: {hashBase64}");
        Console.WriteLine($"Salt: {saltBase64}");
    }
}
