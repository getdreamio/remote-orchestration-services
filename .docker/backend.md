# ROS Backend Service

## About ROS

Remote Orchestration Services (ROS) is part of the [Dream Platform](https://www.getdream.io), a comprehensive solution for managing microfrontend architectures at scale. As an open-source project ([GitHub Repository](https://github.com/getdreamio)), ROS provides the core infrastructure needed to orchestrate and manage module federation in enterprise environments.

## Backend Overview

The ROS Backend provides the core infrastructure and APIs that power the microfrontend management platform. It handles:

1. **Storage and Distribution**
   - Cloud storage integration (AWS S3, Azure Blob)
   - Internal module hosting
   - CDN integration and management
   - Version management and distribution

2. **Security and Access Control**
   - Fine-grained access control at host level
   - Authentication system integration
   - Comprehensive audit logging
   - Data sovereignty compliance
   - Security policy enforcement

3. **System Integration**
   - API endpoints for module federation
   - Real-time monitoring and metrics
   - Event processing and notifications
   - Integration with existing infrastructure

4. **Performance and Reliability**
   - High-availability configuration
   - Load balancing and scaling
   - Cache management
   - Health monitoring and diagnostics

## Core Capabilities
- Remote module configuration management
- Host-remote relationship tracking
- Access control and security management
- Cloud storage integration (AWS S3, Azure Blob)
- Real-time analytics and monitoring
- Version control and deployment orchestration

## Base Images
- Runtime: `mcr.microsoft.com/dotnet/aspnet:8.0`
- Build: `mcr.microsoft.com/dotnet/sdk:8.0`

## Build Process
1. **Build Stage**:
   - Restores NuGet packages
   - Copies source code
   - Builds application in Release configuration

2. **Publish Stage**:
   - Creates optimized production build
   - Publishes to `/app/publish` directory

3. **Final Stage**:
   - Uses runtime-only base image
   - Copies published files
   - Configures ASPNET_CORE URLs
   - Sets up entry point

## Environment Variables
- `ASPNETCORE_ENVIRONMENT`: Runtime environment (default: Development)
- `ASPNETCORE_URLS`: API endpoints (http://+:5000;https://+:5001)
- `ASPNETCORE_Kestrel__Certificates__Default__Path`: SSL certificate path
- `ASPNETCORE_Kestrel__Certificates__Default__Password`: SSL certificate password

## Development Usage
```bash
# Build and run backend container
docker-compose up backend

# Build backend container only
docker-compose build backend
```

## Production Considerations
- Use proper SSL certificate management
- Configure appropriate security headers
- Set ASPNETCORE_ENVIRONMENT to Production
- Implement proper logging configuration
- Consider using Docker health checks
- Implement proper backup strategies for any persistent data

## Ports
- HTTP: 5000 (internal and host)
- HTTPS: 5001 (internal and host)

## Volumes
- SSL Certificates: `~/.aspnet/https:/https:ro` (read-only)
