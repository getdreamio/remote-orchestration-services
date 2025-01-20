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

2. Update the certificate password in `docker-compose.yml` if you used a different password.

## Building and Running the Services

1. Create a `docker-compose.yml` file in the root directory with the following content:
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      target: frontend
    ports:
      - "8080:8080"
    environment:
      - VITE_API_URL=http://localhost:5000

  backend:
    build:
      context: .
      target: final
    ports:
      - "5000:5000"
      - "5001:5001"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:5000;https://+:5001
      - ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx
      - ASPNETCORE_Kestrel__Certificates__Default__Password=YourSecurePassword
    volumes:
      - ~/.aspnet/https:/https:ro
```

2. Start the services:
```bash
docker-compose up -d
```

The applications will be available at:
- Frontend: http://localhost:8080
- API Endpoints: 
  - HTTP: http://localhost:5000
  - HTTPS: https://localhost:5001

## Environment Variables

### Frontend Environment Variables
- `VITE_API_URL`: URL of the backend API

### Backend Environment Variables
```bash
docker-compose up -d \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection=your_connection_string
```

Additional HTTPS-related environment variables:
- `ASPNETCORE_Kestrel__Certificates__Default__Path`: Path to the SSL certificate
- `ASPNETCORE_Kestrel__Certificates__Default__Password`: Certificate password

## Health Check

You can verify the API is running by accessing either:
```
http://localhost:5000/health
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
   - If the frontend can't connect to the backend, ensure the `VITE_API_URL` is set correctly
   - If ports are already in use, modify the port mappings in docker-compose.yml
   - If HTTPS is not working, verify that:
     - The development certificate exists in ~/.aspnet/https/
     - The certificate password matches the one in docker-compose.yml
     - The certificate is trusted on your system
