# Manufacturing Dashboard — React + Node.js (WebSocket)

## Overview
This project simulates a real-time manufacturing monitoring dashboard.
It consists of a backend PLC simulator (Node.js + WebSocket) and a frontend (React + Chart.js)
that displays live machine telemetry and alerts.

## Architecture
**Backend:** Node.js + Express + ws  
**Frontend:** React + Vite + TypeScript  
**Communication:** WebSocket (real-time) + REST (alert history)  
**Containerization:** Docker + docker-compose  

```mermaid
flowchart LR
  subgraph Frontend [React Dashboard]
    F1[Chart.js Real-Time Graphs]
    F2[Alert Table / Notifications]
  end

  subgraph Backend [Node.js PLC Simulator]
    B1[Sensor Data Generator]
    B2[/api/alarms (History)]
    B3[(In-Memory Alarm Buffer)]
  end

  F1 <-- WebSocket (telemetry) --> B1
  F2 <-- REST (GET /api/alarms) --> B2
```

---

## Commands

### Backend
```bash
cd backend
npm install
npm run dev
```

### Configuración por entorno (backend)

El backend lee variables desde `.env` (usa `.env.example` como base):

| Variable       | Descripción                              | Default |
|----------------|------------------------------------------|----------|
| `PORT`         | Puerto HTTP/WS del backend               | `4000`   |
| `TICK_MS`      | Intervalo de emisión del simulador (ms)  | `3000`   |
| `ALERT_RPM`    | Umbral de alerta por RPM                 | `6000`   |
| `ALERT_TEMP`   | Umbral de alerta por temperatura (°C)    | `90`     |
| `ALARM_BUFFER` | Cantidad máxima de alertas en memoria    | `100`    |
| `CORS_ORIGINS` | Orígenes permitidos (coma-separado)      | `*`      |

**Healthcheck:**  
`GET /health` → `{ "status": "ok", "uptime": <segundos>, "timestamp": "..." }`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Full stack (Docker Compose)
```bash
docker compose up --build
```

---

## Production (Docker)

Requisitos: Docker Desktop / Docker Engine.

1. Configura `backend/.env` (usa `.env.example` como base).  
2. Construye y levanta los servicios:

```bash
docker compose up --build
```

**Servicios:**
- **Frontend (nginx):** http://localhost:8080  
- **Backend (Node.js):** http://localhost:4000  
- **Healthcheck:** `GET /health` (usado por Docker para `service_healthy`)

El archivo `docker-compose.yml` define `depends_on: condition: service_healthy`, lo que asegura que el frontend no se levante hasta que el backend haya pasado su chequeo de salud.

---

## Folder Structure
```
manufacturing-dashboard/
├─ backend/
│  ├─ index.js
│  ├─ Dockerfile
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ src/
│  ├─ Dockerfile
│  └─ package.json
├─ docker-compose.yml
└─ README.md
```

---

## Healthcheck Validation
```bash
curl http://localhost:4000/health
# → { "status":"ok","uptime":42,"timestamp":"2025-11-10T00:00:00Z" }
```

---

## Notes
- This project demonstrates **real-time communication**, **REST integration**, and **container orchestration**.  
- Designed for production readiness: includes CI/CD support, Docker healthchecks, and separation of concerns between backend and frontend.
