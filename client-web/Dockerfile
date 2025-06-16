# Use Node.js image to build the Vite React application
FROM node:20-alpine AS build

# Create non-root user for build
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set the working directory for the build
WORKDIR /app

# Change ownership of the app directory and npm cache to nodejs user
RUN chown -R nodejs:nodejs /app && \
    mkdir -p /home/nodejs/.npm && \
    chown -R nodejs:nodejs /home/nodejs/.npm

# Copy package.json and package-lock.json (or yarn.lock) for dependency installation
COPY --chown=nodejs:nodejs package*.json ./

# Switch to non-root user before installing dependencies
USER nodejs

# Install project dependencies as nodejs user
RUN npm ci && npm cache clean --force

# Copy the rest of the project files
COPY --chown=nodejs:nodejs . .

# Build the Vite application for production
RUN npm run build

# Use a lightweight Nginx image to serve the Vite build
FROM nginx:alpine

# Create non-root user for nginx
RUN addgroup -g 1001 -S webapp && \
    adduser -S webuser -u 1001 -G webapp

# Copy the Vite build files (dist folder) to the Nginx html directory
COPY --from=build --chown=webuser:webapp /app/dist /usr/share/nginx/html

# Create a simple health check file
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>OK</h1></body></html>' > /usr/share/nginx/html/health

# Create nginx configuration for non-root user
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R webuser:webapp /var/cache/nginx && \
    chown -R webuser:webapp /var/log/nginx && \
    chown -R webuser:webapp /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown webuser:webapp /var/run/nginx.pid

# Copy nginx configuration
COPY --chown=webuser:webapp nginx.conf /etc/nginx/nginx.conf

# Switch to non-root user
USER webuser

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port 8080 (non-privileged port)
EXPOSE 8080

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
