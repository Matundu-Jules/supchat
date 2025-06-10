# Use Node.js image to build the Vite React application
FROM node:20-alpine AS build

# Set the working directory for the build
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) for dependency installation
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Build the Vite application for production
RUN npm run build

# Use a lightweight Nginx image to serve the Vite build
FROM nginx:alpine

# Copy the Vite build files (dist folder) to the Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (default HTTP port)
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
