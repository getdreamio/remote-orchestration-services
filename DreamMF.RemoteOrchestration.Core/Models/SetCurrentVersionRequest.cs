using System;

namespace DreamMF.RemoteOrchestration.Core.Models;

public class SetCurrentVersionRequest
{
    public required string Version { get; set; }
}