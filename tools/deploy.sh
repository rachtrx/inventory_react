#!/bin/bash

# Define the services in order
services=("backend" "frontend" "nginx-inventory")

echo "Pruning Docker"
docker system prune -a -f

echo "Starting sequential Docker build and deployment..."

# Loop through each service and build + start it
for service in "${services[@]}"; do
    echo "Building $service..."
    docker-compose -f docker-compose.yml build "$service"
    
    echo "Starting $service..."
    docker-compose -f docker-compose.yml up -d "$service"

    echo "$service is now running!"
done

echo "All services are built and running sequentially!"
