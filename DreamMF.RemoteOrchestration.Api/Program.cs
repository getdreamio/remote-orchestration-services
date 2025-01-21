using DreamMF.RemoteOrchestration.Api.Routes;
using DreamMF.RemoteOrchestration.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using DreamMF.RemoteOrchestration.Core.Middleware;
using DreamMF.RemoteOrchestration.Core.Services;
using DreamMF.RemoteOrchestration.Core.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.StaticFiles;
using DreamMF.RemoteOrchestration.Api.Filters;

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
    c.SwaggerDoc("v1", new OpenApiInfo { 
        Title = "Remote Orchestration API", 
        Version = "v1",
        Description = @"### Authentication
To use protected endpoints:
1. Expand the /api/auth/login endpoint
2. Click 'Try it out'
3. Enter your credentials and execute
4. Copy the token from the response
5. Click 'Authorize' at the top
6. Enter the token as: Bearer your-token-here"
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.\r\n\r\n" +
                     "Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\n" +
                     "Example: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Add operation filter to mark endpoints as requiring authentication
    c.OperationFilter<SecurityRequirementsOperationFilter>();
});

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
    options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    options.SerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]))
        };
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
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();

builder.Services.AddAntiforgery();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Remote Orchestration API v1"));
//app.UseHttpsRedirection();

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
app.MapUserRoutes();
app.MapAuthRoutes();

var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".js"] = "application/javascript";

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "remotes")),
    RequestPath = "/remotes",
    ServeUnknownFileTypes = true,
    ContentTypeProvider = provider,
    DefaultContentType = "application/octet-stream",
    OnPrepareResponse = ctx =>
    {
        Console.WriteLine($"Serving file: {ctx.File.PhysicalPath} - {ctx.File.Name}");
    }
});

app.UseDirectoryBrowser(new DirectoryBrowserOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "remotes")),
    RequestPath = "/remotes"
});

app.Run();
