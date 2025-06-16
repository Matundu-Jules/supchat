# Use a lightweight Node.js image for production
FROM node:24-alpine3.22

# Update Alpine packages to address vulnerabilities
RUN apk update && apk upgrade --no-cache

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set environment variables to disable prompts
ENV CI=true \
    EXPO_NO_INTERACTIVE=true

# Install global CLI tools
RUN npm install -g expo @expo/ngrok && npm cache clean --force

# Set the working directory in the container
WORKDIR /app

# Copy dependency files first for efficient Docker caching
COPY package*.json ./

# Install project dependencies
RUN npm ci && npm cache clean --force

# Install TypeScript types
RUN npm install --save-dev @types/react-native

# Copy the rest of the app files
COPY --chown=nodejs:nodejs . .

# Create health check script
RUN echo '#!/bin/sh\ncurl -f http://localhost:8081 > /dev/null 2>&1 || exit 1' > /app/health-check.sh && \
    chmod +x /app/health-check.sh && \
    chown nodejs:nodejs /app/health-check.sh

# Switch to non-root user
USER nodejs

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD /app/health-check.sh

# Expose the Metro Bundler port
EXPOSE 8081

# Start the Expo development server with tunneling
CMD ["npx", "expo", "start", "--clear", "--tunnel"]

