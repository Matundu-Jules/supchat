# Use a lightweight Node.js image for production
FROM node:18-alpine3.19

# Update Alpine packages to address vulnerabilities
RUN apk update && apk upgrade --no-cache

# Set environment variables to disable prompts
ENV CI=true \
    EXPO_NO_INTERACTIVE=true

# Install global CLI tools
RUN npm install -g expo @expo/ngrok

# Set the working directory in the container
WORKDIR /app

# Copy dependency files first for efficient Docker caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Install TypeScript types
RUN npm install --save-dev @types/react-native

# Copy the rest of the app files
COPY . .

# Expose the Metro Bundler port
EXPOSE 8081

# Start the Expo development server with tunneling
CMD ["npx", "expo", "start", "--clear", "--tunnel"]

