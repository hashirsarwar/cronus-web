# syntax=docker/dockerfile:1

# Build stage. Node only exists here to produce static assets, so it is not carried into the image.
FROM node:24-alpine AS build
WORKDIR /app

# npm ci installs strictly from the lockfile, so the build is reproducible. Copying the manifests
# first keeps this layer cached while only application code changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage: a static file server, with no Node or toolchain and no dev dependencies.
FROM nginxinc/nginx-unprivileged:1.31-alpine AS runtime

# Copy the static server config directly; it contains no environment-specific upstream.
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# nginx-unprivileged already listens on 8080 and runs as a non-root user.
EXPOSE 8080

# Use liveness so a bundle failure does not mark a responding nginx process unhealthy.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/health/live || exit 1
