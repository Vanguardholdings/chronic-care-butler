# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (tsx needed at runtime)
RUN npm ci

# Copy source code
COPY . .

# Remove the test seed file that has wrong imports
RUN rm -f src/server/seed-demo.ts

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start server using tsx (same as dev)
CMD ["npx", "tsx", "src/server/index.ts"]
