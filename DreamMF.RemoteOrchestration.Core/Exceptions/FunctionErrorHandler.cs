using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DreamMF.RemoteOrchestration.Core.Exceptions;

public static class FunctionErrorHandler
{
    public static ObjectResult Handle(Exception ex)
    {
        var error = new HandledResult<Exception>(ex).HandleException();
        var result = new ObjectResult(error);
        result.StatusCode = StatusCodes.Status500InternalServerError;
        return result;
    }

    public static ObjectResult Handle(HandledException ex)
    {
        var result = new ObjectResult(ex);
        result.StatusCode = (int)ex.StatusCode;
        return result;
    }
}