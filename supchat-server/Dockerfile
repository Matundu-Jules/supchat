# Use a lightweight Node.js image with LTS support
FROM node:lts-alpine

# Install security updates and curl for health checks
RUN apk update && apk upgrade && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install project dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the project files and set ownership
COPY --chown=nodeuser:nodejs . .

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nodeuser:nodejs logs

# Switch to non-root user
USER nodeuser

# Expose the API port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the Node.js server
CMD ["npm", "start"]
