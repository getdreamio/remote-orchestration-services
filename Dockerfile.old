# Build Frontend
FROM node:20-alpine AS frontend
WORKDIR /src/frontend
COPY ["DreamMF.RemoteOrchestration.Frontend/package*.json", "./"]
COPY ["DreamMF.RemoteOrchestration.Frontend/pnpm-lock.yaml", "./"]
RUN npm install -g pnpm && pnpm install
COPY ["DreamMF.RemoteOrchestration.Frontend", "./"]
RUN pnpm run build

# Write environment variables to env-config.json
ARG BACKEND_URL
ARG AUTH_AUTHORITY
ARG AUTH_CLIENT_ID
RUN echo '{"BACKEND_URL":"'$BACKEND_URL'","AUTH_AUTHORITY":"'$AUTH_AUTHORITY'","AUTH_CLIENT_ID":"'$AUTH_CLIENT_ID'"}' > /src/frontend/dist/env-config.json

# Serve Frontend
FROM nginx:alpine AS frontend-server
COPY --from=frontend /src/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Build API
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 4000
EXPOSE 4001

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
COPY dreammf-ros.pfx /https/aspnetapp.pfx
ENV ASPNETCORE_URLS=http://+:4000;https://+:4001
ENV ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx
ENV ASPNETCORE_Kestrel__Certificates__Default__Password=Dr34m0120225
ENTRYPOINT ["dotnet", "DreamMF.RemoteOrchestration.Api.dll"]
