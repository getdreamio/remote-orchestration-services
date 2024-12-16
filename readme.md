# Dream.mf Remote Orchestration Services

## Overview

Dream.mf Remote Orchestration Services is a microservice designed to facilitate frontend applications that utilize Module Federation technology. It centralizes configuration, host and remote details, versions, files, and relationships within the product. The service acts as a proxy, storing files in either Azure Blob Storage or AWS S3 buckets.

## Features
- **Centralized Configuration**: Host all configuration details for Module Federation in one place.
- **Proxy Service**: Acts as a proxy for storing files in Azure Blob Storage or AWS S3.
- **Version Control**: Manage different versions of files and configurations.
- **Relationship Management**: Maintain relationships between different modules and services.

## Architecture
The service architecture is designed to support scalability and reliability. It includes:
- **Microservices**: Each component is a separate microservice, allowing for independent scaling and deployment.
- **Storage**: Utilizes cloud storage solutions like Azure Blob Storage and AWS S3 for file storage.
- **Orchestration**: Manages the orchestration of module federation configurations.

## Getting Started

### Prerequisites
- Node.js
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
   npm install
   ```

## Usage
1. Configure your Azure Blob Storage or AWS S3 bucket details in the configuration file.
2. Start the service:
   ```bash
   dotnet run
   ```
3. Access the service via the provided endpoint.

## Documentation
For detailed information on the architecture and design, refer to the diagrams in the `.docs` folder.

## Contributing
Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) for more information.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
