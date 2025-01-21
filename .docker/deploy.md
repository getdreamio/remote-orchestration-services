# DreamMF Remote Orchestration Deployment Guide

This guide explains how to build and deploy the DreamMF Remote Orchestration services using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system
- Access to the source code repository

## HTTPS Certificate Setup

Before running the services, you need to set up an HTTPS development certificate:

1. Create a development certificate:
```bash
dotnet dev-certs https -ep ${HOME}/.aspnet/https/aspnetapp.pfx -p Dr34m0120225
dotnet dev-certs https --trust
```

Update the certificate password in `docker-compose.yml` if you used a different password.

2. Start the services:
```bash
docker-compose up -d
```

The applications will be available at:
- Frontend: http://localhost:3000
- API Endpoint: https://localhost:5001

## Environment Variables

### Frontend Environment Variables
- `BACKEND_URL`: URL of the backend API

### Backend Environment Variables
```bash
docker-compose up -d \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection=your_connection_string
```

Additional HTTPS-related environment variables:
- `ASPNETCORE_Kestrel__Certificates__Default__Path`: Path to the SSL certificate
- `ASPNETCORE_Kestrel__Certificates__Default__Password`: Certificate password

## Deploying to Docker Hub

To deploy your Docker containers to Docker Hub, follow these steps:

### Step 1: Log in to Docker Hub

Open your terminal and run the following command to log in:

```bash
docker login
```

You'll be prompted to enter your Docker Hub username and password.

### Step 2: Build and Tag the Docker Images

Build your image with:

```bash
docker-compose build
```

Assuming your Docker Hub username is `dreammf`, tag your images like this:

```bash
docker tag dreammf/ros-frontend:0.9.3 dreammf/ros-frontend:latest
docker tag dreammf/ros-backend:0.9.3 dreammf/ros-backend:latest
```

### Step 3: Push the Images

Push the tagged images to Docker Hub:

```bash
docker push dreammf/ros-frontend:0.9.3
docker push dreammf/ros-backend:0.9.3
```

## Health Check

You can verify the API is running by accessing either:
```
https://localhost:5001/health
```

## Troubleshooting

1. If the containers fail to start, check the logs:
```bash
# View frontend logs
docker-compose logs frontend

# View backend logs
docker-compose logs backend
```

2. To enter the containers for debugging:
```bash
# Frontend container
docker-compose exec frontend /bin/sh

# Backend container
docker-compose exec backend /bin/bash
```

3. Common Issues:
   - If the frontend can't connect to the backend, ensure the `BACKEND_URL` is set correctly
   - If ports are already in use, modify the port mappings in docker-compose.yml
   - If HTTPS is not working, verify that:
     - The development certificate exists in ~/.aspnet/https/
     - The certificate password matches the one in docker-compose.yml
     - The certificate is trusted on your system
