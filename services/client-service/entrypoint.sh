#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z $DB_HOST 5432; do
  sleep 1
done
echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
psql -h $DB_HOST -U $DB_USER -d $DB_DATABASE -f src/db/schema.sql

# Start the application
echo "Starting Client Service..."
node src/server.js 