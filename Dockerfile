# Use the official .NET image as a parent image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["DreamMF.RemoteOrchestration.Api/DreamMF.RemoteOrchestration.Api.csproj", "DreamMF.RemoteOrchestration.Api/"]
COPY ["DreamMF.RemoteOrchestration.Core/DreamMF.RemoteOrchestration.Core.csproj", "DreamMF.RemoteOrchestration.Core/"]
COPY ["DreamMF.RemoteOrchestration.Database/DreamMF.RemoteOrchestration.Database.csproj", "DreamMF.RemoteOrchestration.Database/"]
RUN dotnet restore "DreamMF.RemoteOrchestration.Api/DreamMF.RemoteOrchestration.Api.csproj"

COPY . .
WORKDIR "/src/DreamMF.RemoteOrchestration.Api"
RUN dotnet build "DreamMF.RemoteOrchestration.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DreamMF.RemoteOrchestration.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DreamMF.RemoteOrchestration.Api.dll"]
