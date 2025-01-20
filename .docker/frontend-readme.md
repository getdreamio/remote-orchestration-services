# Dream.mf Frontend

## Overview
This is the Docker image for the Dream.mf frontend application.

## Usage
To run the frontend service, use the following command:

```bash
docker run -p 3000:3000 dreammf/dream.mf-frontend:0.9.0
```

## Environment Variables
- `BACKEND_URL`: URL of the backend service.
- `AUTH_AUTHORITY`: Authentication authority URL.
- `AUTH_CLIENT_ID`: Client ID for authentication.

## Ports
- `3000`: The port on which the frontend service runs.
