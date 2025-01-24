using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;

namespace DreamMF.RemoteOrchestration.Api.Routes;

public static class ConfigurationRoutes
{
    private const string GroupName = "Configurations";

    public static void MapConfigurationRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/api/configurations").WithTags(GroupName);
        group.MapConfigurationsApi();
    }

    private static RouteGroupBuilder MapConfigurationsApi(this RouteGroupBuilder group)
    {
        group.RequireAuthorization();

        group.MapGet("", GetAllConfigurations)
            .Produces<List<ConfigurationResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("List all configurations"))
            .WithSummary("Get All Configurations")
            .WithDescription("Retrieves a list of all configurations");

        group.MapGet("{id}", GetConfigurationById)
            .Produces<ConfigurationResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get configuration by ID"))
            .WithSummary("Get Configuration by ID")
            .WithDescription("Retrieves a specific configuration by its unique identifier");

        group.MapGet("key/{key}", GetConfigurationByKey)
            .Produces<ConfigurationResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Get configuration by key"))
            .WithSummary("Get Configuration by Key")
            .WithDescription("Retrieves a specific configuration by its key");

        group.MapPost("", UpdateConfiguration)
            .Produces<ConfigurationResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Update configuration"))
            .WithSummary("Update Configuration")
            .WithDescription("Updates an existing configuration");

        group.MapPost("batch", UpdateConfigurationBatch)
            .Produces<List<ConfigurationResponse>>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Batch update configurations"))
            .WithSummary("Batch Update Configurations")
            .WithDescription("Updates multiple configurations in a single request");

        group.MapDelete("{id}", DeleteConfiguration)
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Delete configuration"))
            .WithSummary("Delete Configuration")
            .WithDescription("Deletes an existing configuration");

        return group;
    }

    private static async Task<IResult> GetAllConfigurations(ConfigurationService configurationService)
    {
        var configurations = await configurationService.GetAllConfigurationsAsync();
        return Results.Ok(configurations);
    }

    private static async Task<IResult> GetConfigurationById(int id, ConfigurationService configurationService)
    {
        var configuration = await configurationService.GetConfigurationByIdAsync(id);
        if (configuration == null)
            return Results.NotFound();
        return Results.Ok(configuration);
    }

    private static async Task<IResult> GetConfigurationByKey(string key, ConfigurationService configurationService)
    {
        var configuration = await configurationService.GetConfigurationByKeyAsync(key);
        if (configuration == null)
            return Results.NotFound();
        return Results.Ok(configuration);
    }

    private static async Task<IResult> UpdateConfiguration(ConfigurationRequest request, ConfigurationService configurationService)
    {
        var configuration = await configurationService.UpdateConfigurationAsync(request);
        if (configuration == null)
            return Results.NotFound();
        return Results.Ok(configuration);
    }

    private static async Task<IResult> UpdateConfigurationBatch(
        List<ConfigurationRequest> requests, 
        ConfigurationService configurationService)
    {
        var configurations = await configurationService.UpdateConfigurationBatchAsync(requests);
        return Results.Ok(configurations);
    }

    private static async Task<IResult> DeleteConfiguration(int id, ConfigurationService configurationService)
    {
        var result = await configurationService.DeleteConfigurationAsync(id);
        if (!result)
            return Results.NotFound();
        return Results.NoContent();
    }
}
