# --- Build ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# --omit=dev: skip devDependencies in the build layer to reduce image size
RUN npm ci --omit=dev=false --no-audit --no-fund
COPY . .
RUN npm run build

# --- Serve ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Mount custom nginx config (SPA routing, gzip, cache, security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
