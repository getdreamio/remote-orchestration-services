namespace DreamMF.RemoteOrchestration.Core.Models;

public class RemoteResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string Repository { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string DocumentationUrl { get; set; } = string.Empty;
    public List<ModuleResponse> Modules { get; set; } = new List<ModuleResponse>();
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}

public class RemoteSummaryResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public List<ModuleResponse> Modules { get; set; } = new List<ModuleResponse>();
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}

public class ModuleResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public long Created_Date { get; set; }
    public long Updated_Date { get; set; }
}
