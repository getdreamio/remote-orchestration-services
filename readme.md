# Dream.mf Remote Orchestration Services

## Overview

Dream.mf Remote Orchestration Services is a microservice designed to facilitate frontend applications that utilize Module Federation technology. It centralizes configuration, host and remote details, versions, files, and relationships within the product. The service acts as a proxy, storing files in either Azure Blob Storage or AWS S3 buckets.

## Features
- **Centralized Configuration**: Host all configuration details for Module Federation in one place.
- **Proxy Service**: Acts as a proxy for storing files in Azure Blob Storage or AWS S3.
- **Version Control**: Manage different versions of files and configurations.
- **Relationship Management**: Maintain relationships between different modules and services.

## Screenshots
You can see more screenshots here: [screenshots.md](screenshots.md)

## Architecture
The service architecture is designed to support scalability and reliability. It includes:
- **Microservices**: Each component is a separate microservice, allowing for independent scaling and deployment.
- **Storage**: Utilizes cloud storage solutions like Azure Blob Storage and AWS S3 for file storage.
- **Orchestration**: Manages the orchestration of module federation configurations.

## Getting Started

### Prerequisites
- C# Dotnet
- Azure or AWS account for storage

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/remote-orchestration-services.git
   ```
2. Navigate to the project directory:
   ```bash
   cd remote-orchestration-services
   ```
3. Install dependencies:
   ```bash
   dotnet restore
   ```

## Usage
1. Configure your Azure Blob Storage or AWS S3 bucket details in the configuration file.
2. Start the service:
   ```bash
   dotnet run --project DreamMF.RemoteOrchestration.Api
   ```
3. Access the service via the provided endpoint.

## Authentication 
When you first run the service, you will have a default user registered with the following credentials:
- Email address: `root@dreammf.com`
- Password: `Dr34m!12345`

## Documentation
For detailed information on the architecture and design, refer to the diagrams in the `.docs` folder.

## License
This project is licensed under the GPLv2 License. See the [LICENSE.GPL2](LICENSE.GPL2) file for details.
