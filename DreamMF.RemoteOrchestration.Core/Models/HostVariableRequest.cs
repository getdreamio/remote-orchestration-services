using System.ComponentModel.DataAnnotations;

namespace DreamMF.RemoteOrchestration.Core.Models;

public class HostVariableRequest
{
    [Required]
    [RegularExpression(@"^[^\s]+$", ErrorMessage = "Key cannot contain spaces")]
    public string Key { get; set; } = string.Empty;
    
    public string Value { get; set; } = string.Empty;
}
