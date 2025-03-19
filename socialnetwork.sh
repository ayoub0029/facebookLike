#!/bin/bash

# Print steps as they execute
set -x

echo "=== Docker Cleanup and Application Startup Script ==="
echo "Stopping all running containers..."
docker stop $(docker ps -aq) 2>/dev/null || echo "No containers running"

echo "Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || echo "No containers to remove"

echo "Removing all networks (except default ones)..."
docker network prune -f

echo "Removing all dangling images..."
docker image prune -f

echo "Checking if docker-compose.yml exists..."
if [ ! -f "docker-compose.yml" ]; then
  echo "Error: docker-compose.yml not found in current directory!"
  echo "Please run this script from the directory containing docker-compose.yml"
  exit 1
fi

echo "Building containers with no cache..."
docker-compose build --no-cache

echo "Starting application with docker-compose..."
docker-compose up -d

echo "=== Application startup complete ==="
echo "Containers now running:"
docker ps

echo "Watching logs (Ctrl+C to exit)..."
docker-compose logs -f