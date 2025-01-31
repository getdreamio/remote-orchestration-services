# ROS Frontend Service

## About ROS

Remote Orchestration Services (ROS) is part of the [Dream Platform](https://www.getdream.io), a comprehensive solution for managing microfrontend architectures at scale. As an open-source project ([GitHub Repository](https://github.com/getdreamio)), ROS provides the core infrastructure needed to orchestrate and manage module federation in enterprise environments.

## Frontend Overview

The ROS Frontend provides a powerful web-based dashboard for managing your microfrontend ecosystem. It serves as the primary interface for:

1. **Remote Module Management**
   - Visual configuration of remote modules
   - Version control and deployment tracking
   - Host-remote relationship visualization
   - Dependency graph management

2. **Monitoring & Analytics**
   - Real-time health monitoring dashboard
   - Usage analytics and insights
   - Performance metrics visualization
   - System status reporting

3. **Access Control Interface**
   - User and role management
   - Permission configuration
   - Audit log visualization
   - Security policy management

## Base Image
- `node:20-alpine`
- Lightweight Node.js 20.x runtime based on Alpine Linux

## Build Process
1. Sets up working directory at `/src/frontend`
2. Installs pnpm package manager
3. Copies and installs package dependencies using pnpm
4. Copies frontend application source code
5. Exposes port 8080 for development server

## Environment Variables
- `BACKEND_URL`: URL for the backend API (default: https://localhost:4001)
- `AUTH_AUTHORITY`: Authentication authority URL (default: https://localhost:4001)
- `AUTH_CLIENT_ID`: Client ID for authentication (default: DreamMF-Web-01202025)

## Development Usage
```bash
# Build and run frontend container
docker-compose up frontend

# Build frontend container only
docker-compose build frontend
```

Using either with ARGS...

```bash
# Start frontend container with BACKEND_URL argument
docker run -e BACKEND_URL=https://your-backend-url -p 3000:80 dreammf/ros-frontend:0.9.2

# Using docker-compose with BACKEND_URL argument
docker-compose run -e BACKEND_URL=https://your-backend-url frontend
```

## Production Considerations
- Consider using a multi-stage build for production to minimize final image size
- Implement proper NGINX configuration for serving static files
- Set appropriate NODE_ENV values
- Implement proper security headers
- Consider using Docker health checks

## Ports
- `3000`: Frontend server
- `4000`: HTTP backend server
- `4001`: HTTPS backend server

## Volumes
No persistent volumes required for frontend container.

## Image Version
- Frontend: `dreammf/ros-frontend:0.9.2`
- Backend: `dreammf/ros-backend:0.9.2`
