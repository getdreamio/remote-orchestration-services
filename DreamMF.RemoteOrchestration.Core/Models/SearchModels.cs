namespace DreamMF.RemoteOrchestration.Core.Models;

/// <summary>
/// Request model for performing a search across hosts and remotes
/// </summary>
public class SearchRequest
{
    /// <summary>
    /// The text to search for in hosts and remotes
    /// </summary>
    public string SearchText { get; set; } = string.Empty;
}

/// <summary>
/// Response model containing search results for both hosts and remotes
/// </summary>
public class SearchResponse
{
    /// <summary>
    /// List of hosts that match the search criteria
    /// </summary>
    public List<HostResponse> Hosts { get; set; } = new();

    /// <summary>
    /// List of remotes that match the search criteria
    /// </summary>
    public List<RemoteResponse> Remotes { get; set; } = new();

    /// <summary>
    /// Total number of matches found
    /// </summary>
    public int TotalMatches => Hosts.Count + Remotes.Count;

    /// <summary>
    /// Timestamp when the search was performed
    /// </summary>
    public long SearchTimestamp { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
}
