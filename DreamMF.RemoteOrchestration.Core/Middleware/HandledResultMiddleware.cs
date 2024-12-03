using Microsoft.Extensions.Options;
using System.Text.Json;
using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Http;

namespace DreamMF.RemoteOrchestration.Core.Middleware;

public class HandledResultMiddleware
{
	private readonly RequestDelegate _next;

	public HandledResultMiddleware(RequestDelegate next)
	{
		_next = next;
	}

	public async Task Invoke(HttpContext context)
	{
		try
		{
			await _next.Invoke(context);
		}
		catch (Exception ex)
		{
			var error = new HandledResult<Exception>(ex).HandleException();
			var response = context.Response;
			response.ContentType = "application/json";
			response.StatusCode = error.StatusCode;
			var result = JsonSerializer.Serialize(error);
			await response.WriteAsync(result);
		}
	}
}

