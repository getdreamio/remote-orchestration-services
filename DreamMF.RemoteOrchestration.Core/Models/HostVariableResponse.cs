namespace DreamMF.RemoteOrchestration.Core.Models;

public class HostVariableResponse
{
    public int Id { get; set; }
    public int HostId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public long CreatedDate { get; set; }
    public long UpdatedDate { get; set; }
}
