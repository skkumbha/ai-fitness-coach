# Multi-stage build for Vue.js frontend
FROM node:18-alpine AS build-stage

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application with API and WebSocket URLs
ARG VITE_API_URL=https://fit.kish.rs/api
ARG VITE_WEBSOCKET_URL=wss://fit.kish.rs/ws
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production-stage

# Copy built application from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Use default nginx configuration (server nginx will handle routing)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 