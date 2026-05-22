# --- STAGE 1: BUILD ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy source code
COPY frontend/package*.json ./frontend/

WORKDIR /app/frontend

# Install dependencies (including esbuild)
# 'npm ci' requires package-lock.json
# But it ensures all dependencies have their correct versions
RUN npm ci

COPY frontend/ .

# Build the project
# Assumes a "build" script in package.json that runs esbuild
RUN npm run build

# --- STAGE 2: PRODUCTION ---
FROM httpd:2.4-alpine

WORKDIR /usr/local/apache2/htdocs

# Copy the built files from the 'builder' stage to the Apache web root
COPY --from=builder /app/frontend/public .

# Expose port 80 (standard HTTP)
EXPOSE 80
