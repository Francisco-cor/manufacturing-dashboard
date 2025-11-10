# --- Build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Serve ---
FROM nginx:1.27-alpine
# Nginx sirve el build de Vite
COPY --from=build /app/dist /usr/share/nginx/html
# Config simple (opcional): gzip ya viene habilitado en alpine modern
EXPOSE 80

# Healthcheck http
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
