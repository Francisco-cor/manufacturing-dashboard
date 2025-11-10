# Manufacturing Dashboard — React + Node.js (WebSocket)

## Overview
This project simulates a real-time manufacturing monitoring dashboard.
It consists of a backend PLC simulator (Node.js + WebSocket) and a frontend (React + Chart.js)
that displays live machine telemetry and alerts.

## Architecture
Backend (Node.js + Express + ws)
Frontend (React + Vite + TypeScript)
Communication: WebSocket (real-time) + REST (alert history)
Containerization: Docker + docker-compose

## Commands
### Backend
```bash
cd backend
npm install
npm run dev
```
### Configuración por entorno (backend)

El backend lee variables desde `.env` (usa `.env.example` como base):

| Variable      | Descripción                              | Default |
|---------------|------------------------------------------|---------|
| `PORT`        | Puerto HTTP/WS del backend               | `4000`  |
| `TICK_MS`     | Intervalo de emisión del simulador (ms)  | `3000`  |
| `ALERT_RPM`   | Umbral de alerta por RPM                 | `6000`  |
| `ALERT_TEMP`  | Umbral de alerta por temperatura (°C)    | `90`    |
| `ALARM_BUFFER`| Cantidad máxima de alertas en memoria    | `100`   |
| `CORS_ORIGINS`| Orígenes permitidos (coma-separado)      | `*`     |

**Healthcheck**
GET /health
→ { "status":"ok", "uptime": <segundos>, "timestamp": "..." }

### Frontend
```bash
cd frontend
npm install
npm run dev
```
### Full stack
```bash
docker-compose up --build
```

---
Generated as a starter repo for Project 3 — John Deere SG6.
