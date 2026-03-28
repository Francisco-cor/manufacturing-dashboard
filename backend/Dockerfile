# --- Build deps ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# --- Runtime ---
FROM node:22-alpine
WORKDIR /app

# Create a non-root user so the process has minimal privileges
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Drop privileges before starting the server
USER appuser

EXPOSE 4000

# wget is already available in Alpine — no extra package needed
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4000/health >/dev/null || exit 1

CMD ["node", "index.js"]
