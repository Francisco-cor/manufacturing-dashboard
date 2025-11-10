# --- Build deps ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# --- Runtime ---
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000

# Healthcheck contra /health
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:4000/health || exit 1

CMD ["node","index.js"]
