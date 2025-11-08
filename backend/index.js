// backend/index.js
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const alarms = []; // ring buffer simple

// REST: devolver historial de alarmas
app.get("/api/alarms", (_req, res) => res.json(alarms));

// WebSocket
const wss = new WebSocketServer({ noServer: true });

function generateMachineData() {
  const rpm = 5000 + Math.random() * 2000;
  const temperature = 70 + Math.random() * 30;
  const status = rpm > 6000 || temperature > 90 ? "ALERT" : "RUNNING";
  const payload = {
    machineId: "ASSEMBLY-LINE-1",
    timestamp: new Date().toISOString(),
    rpm,
    temperature,
    status
  };
  if (status === "ALERT") {
    const alert = { type: rpm > 6000 ? "HighRPM" : "Overheat", level: "CRITICAL" };
    payload.alert = alert;
    alarms.push({ ...payload });
    if (alarms.length > 100) alarms.shift();
  }
  return JSON.stringify(payload);
}

// broadcasting loop
setInterval(() => {
  const data = generateMachineData();
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(data);
  }
}, 3000);

// HTTP server + upgrade WS
const server = app.listen(PORT, () => {
  console.log(`Backend running http://localhost:${PORT}  (WS upgrade enabled)`);
});
server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, ws => wss.emit("connection", ws, req));
});
