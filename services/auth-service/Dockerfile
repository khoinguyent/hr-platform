FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Your app binds to port 4001
EXPOSE 4001

# Define the command to run your app
CMD [ "node", "src/server.js" ]