// backend/index.js
import 'dotenv/config';               // <— lee .env automáticamente
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();

// -------- Configuración (env) --------
const PORT = +(process.env.PORT ?? 4000);
const TICK_MS = +(process.env.TICK_MS ?? 3000);
const ALERT_RPM = +(process.env.ALERT_RPM ?? 6000);
const ALERT_TEMP = +(process.env.ALERT_TEMP ?? 90);
const ALARM_BUFFER = +(process.env.ALARM_BUFFER ?? 100);

const corsOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins.length ? corsOrigins : true
}));

// -------- Estado en memoria --------
const alarms = []; // ring buffer
let startedAt = Date.now();

// -------- Endpoints REST --------
app.get('/api/alarms', (_req, res) => {
  res.json(alarms);
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString()
  });
});

// -------- WebSocket --------
const wss = new WebSocketServer({ noServer: true });

function pushAlarm(payload) {
  alarms.push(payload);
  while (alarms.length > ALARM_BUFFER) alarms.shift();
}

function generateMachineData() {
  // simulación simple con ruido
  const rpm = 5000 + Math.random() * 2000;       // 5000..7000
  const temperature = 70 + Math.random() * 30;   // 70..100
  const status = (rpm >= ALERT_RPM || temperature >= ALERT_TEMP) ? 'ALERT' : 'RUNNING';

  const payload = {
    machineId: 'ASSEMBLY-LINE-1',
    timestamp: new Date().toISOString(),
    rpm,
    temperature,
    status
  };

  if (status === 'ALERT') {
    payload.alert = {
      type: rpm >= ALERT_RPM ? 'HighRPM' : 'Overheat',
      level: 'CRITICAL'
    };
    pushAlarm({ ...payload });
  }

  return JSON.stringify(payload);
}

// broadcasting loop
setInterval(() => {
  const data = generateMachineData();
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(data);
  }
}, TICK_MS);

// HTTP server + upgrade WS
const server = app.listen(PORT, () => {
  console.log(JSON.stringify({
    level: 'info',
    msg: 'backend_started',
    port: PORT,
    tickMs: TICK_MS,
    alertRpm: ALERT_RPM,
    alertTemp: ALERT_TEMP,
    alarmBuffer: ALARM_BUFFER
  }));
});

server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
});
