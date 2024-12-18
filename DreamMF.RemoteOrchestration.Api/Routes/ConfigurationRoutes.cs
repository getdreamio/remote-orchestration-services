using DreamMF.RemoteOrchestration.Core.Exceptions;
using Microsoft.AspNetCore.Builder;
using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;

namespace DreamMF.RemoteOrchestration.Api.Routes;

/// <summary>
/// Provides route configuration for configuration-related endpoints
/// </summary>
public static class ConfigurationRoutes
{
    private const string GroupName = "Configurations";

    /// <summary>
    /// Maps all configuration-related routes for the application
    /// </summary>
    /// <param name="app">The web application to configure routes for</param>
    public static void MapConfigurationRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/api/configurations").WithTags(GroupName);
        group.MapConfigurationsApi();
    }

    /// <summary>
    /// Configures the configuration API endpoints for the route group
    /// </summary>
    /// <param name="group">The route group to configure</param>
    private static RouteGroupBuilder MapConfigurationsApi(this RouteGroupBuilder group)
    {
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

        group.MapPost("", CreateConfiguration)
            .Produces<ConfigurationResponse>(StatusCodes.Status201Created)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Create configuration"))
            .WithSummary("Create Configuration")
            .WithDescription("Creates a new configuration");

        group.MapPut("{id}", UpdateConfiguration)
            .Produces<ConfigurationResponse>(StatusCodes.Status200OK)
            .Produces<HandledResponseModel>(400)
            .Produces<HandledResponseModel>(404)
            .Produces<HandledResponseModel>(500)
            .WithMetadata(new EndpointNameMetadata("Update configuration"))
            .WithSummary("Update Configuration")
            .WithDescription("Updates an existing configuration");

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

    private static async Task<IResult> CreateConfiguration(ConfigurationRequest request, ConfigurationService configurationService)
    {
        var configuration = await configurationService.CreateConfigurationAsync(request);
        return Results.Created($"/api/configurations/{configuration.Id}", configuration);
    }

    private static async Task<IResult> UpdateConfiguration(int id, ConfigurationRequest request, ConfigurationService configurationService)
    {
        var configuration = await configurationService.UpdateConfigurationAsync(id, request);
        if (configuration == null)
            return Results.NotFound();
        return Results.Ok(configuration);
    }

    private static async Task<IResult> DeleteConfiguration(int id, ConfigurationService configurationService)
    {
        var result = await configurationService.DeleteConfigurationAsync(id);
        if (!result)
            return Results.NotFound();
        return Results.NoContent();
    }
}
