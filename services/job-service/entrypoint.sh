#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Database is ready!"

# Run database migrations/schema
echo "Initializing database schema..."
psql -h $DB_HOST -U $DB_USER -d $DB_DATABASE -f src/db/schema.sql

# Start the application
echo "Starting Job Service..."
npm start 