using DreamMF.RemoteOrchestration.Api.Routes;
using DreamMF.RemoteOrchestration.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using DreamMF.RemoteOrchestration.Core.Middleware;
using DreamMF.RemoteOrchestration.Core.Services;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

builder.Services.AddDbContext<IRemoteOrchestrationDbContext, RemoteOrchestrationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

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

builder.Services.AddScoped<HostService>();
builder.Services.AddScoped<RemoteService>();
builder.Services.AddScoped<TagService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Remote Orchestration API v1"));
app.UseHttpsRedirection();

app.UseLoggingMiddleware();
app.UseMiddleware<HandledResultMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.UseCors("AllowAll");

app.MapIndexRoutes();
app.MapHealthRoutes();
app.MapRemoteRoutes();
app.MapHostRoutes();

app.Run();
