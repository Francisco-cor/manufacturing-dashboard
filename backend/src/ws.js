import { WebSocketServer } from 'ws';
import { generateMachineData } from './simulator.js';
import { logError } from './log.js';

/**
 * Creates a WebSocketServer in `noServer` mode and starts the broadcast loop.
 *
 * @param {import('http').Server} httpServer
 * @param {{ TICK_MS: number, ALERT_RPM: number, ALERT_TEMP: number, ALARM_BUFFER: number }} cfg
 * @returns {WebSocketServer}
 */
export function createWebSocketServer(httpServer, cfg) {
  const wss = new WebSocketServer({ noServer: true });

  // Upgrade HTTP → WS
  httpServer.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
  });

  // Broadcast loop: generate one telemetry frame and fan it out to all live clients
  setInterval(() => {
    const data = generateMachineData(cfg);

    for (const client of wss.clients) {
      if (client.readyState !== 1 /* OPEN */) continue;
      try {
        client.send(data);
      } catch (err) {
        logError('ws_send_failed', err);
      }
    }
  }, cfg.TICK_MS);

  return wss;
}
