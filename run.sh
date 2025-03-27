#!/bin/bash

# Global variable for the project name
PROJECT_NAME="shipping-web"

# Function to run the application
run() {
    local env=$1
    echo "Running the application in $env environment..."

    # Build the images and start the containers
    docker compose -f compose.$env.yml up --build -d
}

# Function to stop the application
stop() {
    local env=$1
    echo "Stopping the application in $env environment..."

    # stop the containers
    docker compose -f compose.$env.yml down
}

# Function to clear resources
clear() {
    local env=$1
    echo "Clearing resources in $env environment..."

    # Remove the containers, volumes and images
    docker images --filter=reference="${PROJECT_NAME}*" -q | xargs docker rmi
    docker system prune -f --filter "label=com.docker.compose.project=${PROJECT_NAME}"
}

logs() {
    local env=$1
    echo "Showing logs in $env environment..."

    # Show the logs of the containers
    docker compose -f compose.$env.yml logs -f
}

restart(){
    local env=$1
    echo "Restarting the application in $env environment..."

    # Restart the containers
    docker compose -f compose.$env.yml restart
}

# Main script logic to listen for commands
if [ -z "$1" ]; then
    echo "Usage: $0 {run|stop|clear} [dev|prod]"
    exit 1
fi

command=$1
env=${2:-dev}

case "$command" in
run)
    run "$env"
    ;;
stop)
    stop "$env"
    ;;
clear)
    clear "$env"
    ;;
logs)
    logs "$env"
    ;;
restart)
    restart "$env"
    ;;
*)
    echo "Usage: $0 {run|stop|logs|restart|clear} [dev|prod]"
    exit 1
    ;;
esac
