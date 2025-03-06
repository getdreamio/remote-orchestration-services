#!/bin/bash

# This script helps create EF Core migrations for different database providers
# Usage: ./create-migration.sh <provider> <migration-name> <context>
# Example: ./create-migration.sh sqlite Initial ConfigurationDbContext

provider=$1
migration_name=$2
context=$3

if [ -z "$provider" ] || [ -z "$migration_name" ] || [ -z "$context" ]; then
    echo "Usage: ./create-migration.sh <provider> <migration-name> <context>"
    echo "Providers: sqlite, sqlserver, postgresql, mysql"
    echo "Example: ./create-migration.sh sqlite Initial ConfigurationDbContext"
    exit 1
fi

# Validate provider
if [[ "$provider" != "sqlite" && "$provider" != "sqlserver" && "$provider" != "postgresql" && "$provider" != "mysql" ]]; then
    echo "Error: Provider must be one of: sqlite, sqlserver, postgresql, mysql"
    exit 1
fi

# Set the output directory for the migration
migration_dir="Migrations/${provider}/${context}"
api_proj_dir="../DreamMF.RemoteOrchestration.Api"
db_proj_dir="../DreamMF.RemoteOrchestration.Database"

echo "Creating migration for provider: $provider, context: $context, name: $migration_name"
echo "Migration will be stored in: $migration_dir"

# Create directory if it doesn't exist
mkdir -p "$db_proj_dir/$migration_dir"

# Set temporary environment variables to influence the EF Core migration generation
export TargetProvider=$provider

# Run the EF Core migration command
cd $api_proj_dir
dotnet ef migrations add $migration_name --context $context --output-dir $migration_dir --project $db_proj_dir

echo "Migration created successfully."
echo "Don't forget to update the DbContextFactory to load the correct migrations based on the provider."
