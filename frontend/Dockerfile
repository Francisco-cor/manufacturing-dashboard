# --- Build ---
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
# --omit=dev=false ensures devDependencies (like Vite and TypeScript) are installed for building.
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
