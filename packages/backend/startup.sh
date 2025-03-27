#!/bin/sh
echo "Installing dependencies"
yarn install

echo "Building application"
yarn build

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until nc -z -v -w30 mysql 3306
do
  echo "Waiting for MySQL connection..."
  sleep 5
done
echo "MySQL is up and running!"

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
until nc -z -v -w30 redis 6379
do
  echo "Waiting for Redis connection..."
  sleep 5
done
echo "Redis is up and running!"

# Install netcat if not present (for the connection checks above)
apk add --no-cache netcat-openbsd

# Run database migrations and seed data
echo "Setting up database..."
NODE_OPTIONS="--require ts-node/register" yarn db:setup

case $ENV in
  prod)
    echo "------------ PRODUCTION MODE ------------"
    yarn start
    ;;
  *)
    echo "------------ DEVELOPMENT MODE ------------"
    yarn run dev
    ;;
esac