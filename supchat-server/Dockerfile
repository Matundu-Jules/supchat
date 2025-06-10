# Use a lightweight Node.js image with LTS support
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose the API port
EXPOSE 3000

# Start the Node.js server
CMD ["npm", "start"]
