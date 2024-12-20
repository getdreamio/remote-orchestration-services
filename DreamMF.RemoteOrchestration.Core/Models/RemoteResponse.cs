namespace DreamMF.RemoteOrchestration.Core.Models;

public class RemoteResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string Repository { get; set; } = string.Empty;
    public string Contact_Name { get; set; } = string.Empty;
    public string Contact_Email { get; set; } = string.Empty;
    public string Documentation_Url { get; set; } = string.Empty;
    public List<ModuleResponse> Modules { get; set; } = new List<ModuleResponse>();
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}

public class RemoteSummaryResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public List<ModuleResponse> Modules { get; set; } = new List<ModuleResponse>();
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}

public class ModuleResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTimeOffset Created_Date { get; set; }
    public DateTimeOffset Updated_Date { get; set; }
}
