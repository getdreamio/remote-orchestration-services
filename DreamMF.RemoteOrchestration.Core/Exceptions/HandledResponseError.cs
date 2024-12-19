namespace DreamMF.RemoteOrchestration.Core.Exceptions;

public class HandledResponseError
{
    public string Code { get; set; }
    public string Type { get; set; }
    public string Message { get; set; }
    public string Stacktrace { get; set; }
}