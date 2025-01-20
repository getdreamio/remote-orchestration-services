# Build Frontend
FROM node:20-alpine AS frontend
WORKDIR /src/frontend
COPY ["DreamMF.RemoteOrchestration.Frontend/package*.json", "./"]
COPY ["DreamMF.RemoteOrchestration.Frontend/pnpm-lock.yaml", "./"]
RUN npm install -g pnpm && pnpm install
COPY ["DreamMF.RemoteOrchestration.Frontend", "./"]
EXPOSE 8080
CMD ["pnpm", "run", "dev"]

# Build API
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000
EXPOSE 5001

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
ENV ASPNETCORE_URLS=http://+:5000;https://+:5001
ENTRYPOINT ["dotnet", "DreamMF.RemoteOrchestration.Api.dll"]
