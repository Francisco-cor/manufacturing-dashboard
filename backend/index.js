import express from 'express';
import cors from 'cors';
import { config } from './src/config.js';
import { createRouter } from './src/routes.js';
import { createWebSocketServer } from './src/ws.js';
import { log } from './src/log.js';

const app = express();

app.use(cors({ origin: config.CORS_ORIGINS }));
app.use(createRouter({ startedAt: Date.now() }));

const server = app.listen(config.PORT, () => {
  log('info', 'backend_started', {
    port:        config.PORT,
    tickMs:      config.TICK_MS,
    alertRpm:    config.ALERT_RPM,
    alertTemp:   config.ALERT_TEMP,
    alarmBuffer: config.ALARM_BUFFER,
    corsOrigins: config.CORS_ORIGINS,
  });
});

createWebSocketServer(server, config);
