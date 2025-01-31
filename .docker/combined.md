# ROS Combined Service

## About ROS

Remote Orchestration Services (ROS) is part of the [Dream Platform](https://www.getdream.io), a comprehensive solution for managing microfrontend architectures at scale. As an open-source project ([GitHub Repository](https://github.com/getdreamio)), ROS provides the core infrastructure needed to orchestrate and manage module federation in enterprise environments.

## Combined Service Overview

The ROS Combined Service provides a single container solution that runs both the frontend and backend services. This setup is ideal for:

1. **Development & Testing**
   - Simplified local development environment
   - Integrated testing environment
   - Reduced resource consumption
   - Streamlined deployment process

2. **Small-Scale Deployments**
   - Single container deployment
   - Simplified orchestration
   - Reduced operational complexity
   - Efficient resource utilization

3. **Demo & Evaluation**
   - Quick setup for demonstrations
   - Easy evaluation environment
   - Minimal configuration required
   - Portable deployment unit

## Base Images
- Frontend: `node:20-alpine`
- Backend: `mcr.microsoft.com/dotnet/aspnet:8.0`
- Final: `mcr.microsoft.com/dotnet/aspnet:8.0` with Node.js 20.x and Supervisor

## Build Process
1. **Frontend Build Stage**
   - Sets up working directory at `/src/frontend`
   - Installs pnpm package manager
   - Builds frontend application
   - Prepares production assets

2. **Backend Build Stage**
   - Restores .NET dependencies
   - Builds and publishes backend application
   - Optimizes for production

3. **Final Stage**
   - Combines frontend and backend
   - Installs Node.js and Supervisor
   - Sets up process management
   - Configures environment

## Environment Variables
- `BACKEND_URL`: URL for the backend API (configurable via build arg, default: https://localhost:4001)
- `AUTH_AUTHORITY`: Authentication authority URL (default: http://localhost:4000)
- `AUTH_CLIENT_ID`: Client ID for authentication (default: DreamMF-Web-01202025)
- `ASPNETCORE_URLS`: Backend service URLs (default: http://+:4000;https://+:4001)

## Build Arguments
- `BACKEND_URL`: Optional build argument to set the backend URL during image build

## Exposed Ports
- 3000: Frontend application
- 4000: Backend HTTP
- 4001: Backend HTTPS

## Development Usage
```bash
# Build with default settings
docker build -t dreammf/ros-combined:0.9.0 -f Dockerfile.combined .

# Build with custom backend URL
docker build -t dreammf/ros-combined:0.9.0 -f Dockerfile.combined --build-arg BACKEND_URL=https://your-backend-url:4001 .

# Run the container
docker run -p 3000:3000 -p 4000:4000 -p 4001:4001 dreammf/ros-combined:0.9.0
```

## Process Management
The combined service uses Supervisor to manage both frontend and backend processes:
- Frontend runs on port 3000 using pnpm preview
- Backend runs on ports 4000/4001 using dotnet
- Automatic process restart on failure
- Consolidated logging for both services
