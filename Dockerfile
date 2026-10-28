# Multi-stage Dockerfile: build the PWA with Node + pnpm, then serve with Nginx.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy workspace manifests for dependency caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/
COPY mcp/package.json ./mcp/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy sources required for the build
COPY frontend/ ./frontend/
COPY scripts/ ./scripts/
COPY catalogue/ ./catalogue/

# Build standalone PWA bundle and stage catalogue media
ARG APP_BUILD=""
ENV APP_BUILD=$APP_BUILD
RUN pnpm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine AS runner

# Remove default nginx configuration and content
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend assets (HTML, CSS, JS, media, service worker)
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

