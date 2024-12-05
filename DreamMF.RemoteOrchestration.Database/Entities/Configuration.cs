using System.ComponentModel.DataAnnotations;

namespace DreamMF.RemoteOrchestration.Database.Entities;

public class Configuration
{
    [Key]
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
