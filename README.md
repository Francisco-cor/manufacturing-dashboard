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
