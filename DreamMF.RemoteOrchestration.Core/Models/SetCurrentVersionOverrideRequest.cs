using System;

namespace DreamMF.RemoteOrchestration.Core.Models;

public class SetCurrentVersionOverrideRequest
{
    public int RemoteId { get; set; }
    public string? Url { get; set; }
}
