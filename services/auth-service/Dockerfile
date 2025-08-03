FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Make the entrypoint script executable
RUN chmod +x /usr/src/app/entrypoint.sh

# Set the entrypoint script to be executed when the container starts
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]