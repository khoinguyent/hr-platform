#!/bin/sh

# This script is the entrypoint for the Docker container.
# It ensures the database schema is initialized before starting the main application.

echo "Container entrypoint started..."

# Run the database initialization script
echo "Initializing database schema..."
node src/db/init-db.js

# Check if the init script was successful
if [ $? -eq 0 ]; then
  echo "Database initialization successful. Starting server..."
  # Start the main application
  exec node src/server.js
else
  echo "Database initialization failed. Exiting."
  exit 1
fi