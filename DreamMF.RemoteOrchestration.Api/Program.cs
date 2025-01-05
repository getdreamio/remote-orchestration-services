using DreamMF.RemoteOrchestration.Api.Routes;
using DreamMF.RemoteOrchestration.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using DreamMF.RemoteOrchestration.Core.Middleware;
using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Core.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

builder.Services.AddScoped<IRootConfigurationService, RootConfigurationService>();
builder.Services.AddScoped<IDbContextFactory, DbContextFactory>();

builder.Services.AddScoped<IConfigurationDbContext>(provider => 
{
    var factory = provider.GetRequiredService<IDbContextFactory>();
    return factory.CreateConfigurationDbContext();
});

builder.Services.AddScoped<IRemoteOrchestrationDbContext>(provider => 
{
    var factory = provider.GetRequiredService<IDbContextFactory>();
    return factory.CreateDbContext();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Remote Orchestration API", Version = "v1" });
});

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.Authority = "https://youridentityserver";
        options.RequireHttpsMetadata = false;
        options.Audience = "api1";
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<RemoteOrchestrationDbContext>("Database")
    .AddAzureBlobStorage(builder.Configuration["AzureBlobStorage:ConnectionString"], name: "Azure Blob Storage")
    .AddS3(options =>
    {
        options.AccessKey = builder.Configuration["S3Storage:AccessKeyId"];
        options.SecretKey = builder.Configuration["S3Storage:SecretAccessKey"];
        options.BucketName = "your-bucket-name"; // Replace with actual bucket name
        options.S3Config = new Amazon.S3.AmazonS3Config
        {
            RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(builder.Configuration["S3Storage:Region"])
        };
    }, name: "AWS S3");

// Configure Analytics
builder.Services.Configure<AnalyticsConfig>(builder.Configuration.GetSection("Analytics"));

// Register services
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddHostedService<AnalyticsCleanupService>();

builder.Services.AddScoped<HostService>();
builder.Services.AddScoped<RemoteService>();
builder.Services.AddScoped<TagService>();
builder.Services.AddScoped<SearchService>();
builder.Services.AddScoped<ConfigurationService>();
builder.Services.AddScoped<IDreamService, DreamService>();
builder.Services.AddScoped<IUploadService, UploadService>();

builder.Services.AddAntiforgery();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Remote Orchestration API v1"));
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

app.UseLoggingMiddleware();
app.UseMiddleware<HandledResultMiddleware>();

app.UseCors("AllowAll");

app.MapIndexRoutes();
app.MapConfigurationRoutes();
app.MapHealthRoutes();
app.MapRemoteRoutes();
app.MapHostRoutes();
app.MapTagRoutes();
app.MapSearchRoutes();
app.MapAnalyticsRoutes();
app.MapDreamRoutes();
app.MapUploadRoutes();

app.Run();
