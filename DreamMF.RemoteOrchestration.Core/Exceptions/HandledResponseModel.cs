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

    public HandledResponseModel(List<HandledException> exceptions, HttpStatusCode status = HttpStatusCode.BadRequest)
    {
        StatusCode = (int)status;
        Exceptions = exceptions.Select(x => new HandledResponseError() { Message = x.Message }).ToList();
    }

    public int StatusCode { get; set; }

    public List<HandledResponseError> Exceptions { get; set; }
}