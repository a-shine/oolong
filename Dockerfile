# Dockerfile for Svelte web app served with nginx

# Stage 1: Build the Svelte app
FROM node:14 as build-stage

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./frontend/package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy the entire project
COPY ./frontend .

# Build the Svelte app
RUN npm run build

# Stage 2: Serve the app with NGINX
FROM nginx:alpine as production-stage

# Copy the built app from the previous stage
COPY --from=build-stage /app/public /usr/share/nginx/html

# Remove default NGINX configurations
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d

# Expose the port to listen
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
