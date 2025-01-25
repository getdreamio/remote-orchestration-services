using System.Text.RegularExpressions;

namespace DreamMF.RemoteOrchestration.Core.Utilities;

public static class Validations
{
    public static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        // Define the regex pattern for a valid email address
        string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";

        // Use Regex.IsMatch to check if the email matches the pattern
        return Regex.IsMatch(email, pattern, RegexOptions.IgnoreCase);
    }
}
