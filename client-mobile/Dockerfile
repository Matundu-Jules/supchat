# Use a lightweight Node.js image for production
FROM node:18-alpine

# Install React Native CLI globally
RUN npm install -g expo

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install project dependencies
RUN npm install

# Install TypeScript types
RUN npm install --save-dev @types/react-native

# Copy the rest of the project files
COPY . .

# Expose the development port for React Native
EXPOSE 8081

# Start the React Native development server
CMD ["npx", "expo", "start", "--tunnel"]
