# --- Stage 1: Build Stage ---
# Use an official Node.js image to build the React application.
FROM node:18-alpine AS build

# Set the working directory inside the container.
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker layer caching.
COPY package*.json ./

# Install project dependencies.
RUN npm install

# Copy the rest of the application source code into the container.
COPY . .

# Build the React application for production.
# This creates a `build` folder with static assets.
# Pass environment variables to the build process
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# --- Stage 2: Production Stage ---
# Use a lightweight Nginx image to serve the static files.
FROM nginx:1.25-alpine

# Copy the build output from the 'build' stage to the Nginx HTML directory.
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration file.
# This is crucial for handling React Router.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world.
EXPOSE 80

# The command to start the Nginx server when the container starts.
CMD ["nginx", "-g", "daemon off;"]