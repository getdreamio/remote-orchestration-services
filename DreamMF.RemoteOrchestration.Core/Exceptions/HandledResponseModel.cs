using System.Net;

namespace DreamMF.RemoteOrchestration.Core.Exceptions;

public class HandledResponseModel
{
    public HandledResponseModel(HttpStatusCode status = HttpStatusCode.BadRequest)
    {
        StatusCode = (int)status;
        Exceptions = new List<HandledResponseError>();
    }

    public HandledResponseModel(string message, HttpStatusCode status = HttpStatusCode.BadRequest)
    {
        StatusCode = (int)status;
        Exceptions = new List<HandledResponseError>();
        Exceptions.Add(new HandledResponseError() { Message = message });
    }

    public int StatusCode { get; set; }

    public List<HandledResponseError> Exceptions { get; set; }
}