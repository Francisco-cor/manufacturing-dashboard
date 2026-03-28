import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createRouter } from './routes.js';
import { clearAlarms, pushAlarm } from './simulator.js';

let server;
let baseUrl;

before(async () => {
  const app = express();
  app.use(createRouter({ startedAt: Date.now() }));
  await new Promise(resolve => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

after(() => server?.close());

describe('GET /health', () => {
  test('returns 200 with status "ok"', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
  });

  test('includes numeric uptime', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const body = await res.json();
    assert.equal(typeof body.uptime, 'number');
    assert.ok(body.uptime >= 0);
  });

  test('includes an ISO timestamp', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const body = await res.json();
    assert.ok(Date.parse(body.timestamp), 'timestamp should be a valid date');
  });
});

describe('GET /api/alarms', () => {
  test('returns 200 with an empty array when there are no alarms', async () => {
    clearAlarms();
    const res = await fetch(`${baseUrl}/api/alarms`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), []);
  });

  test('returns stored alarms', async () => {
    clearAlarms();
    pushAlarm(
      { machineId: 'M1', timestamp: '2024-01-01T00:00:00Z', rpm: 6500,
        temperature: 85, status: 'ALERT', alert: { type: 'HighRPM', level: 'CRITICAL' } },
      100
    );
    const res = await fetch(`${baseUrl}/api/alarms`);
    const body = await res.json();
    assert.equal(body.length, 1);
    assert.equal(body[0].machineId, 'M1');
  });

  test('returns all alarms up to the buffer limit', async () => {
    clearAlarms();
    const alarm = { machineId: 'M1', timestamp: 't', rpm: 1, temperature: 1,
                    status: 'ALERT', alert: { type: 'HighRPM', level: 'CRITICAL' } };
    for (let i = 0; i < 5; i++) pushAlarm({ ...alarm, timestamp: `t${i}` }, 100);
    const res  = await fetch(`${baseUrl}/api/alarms`);
    const body = await res.json();
    assert.equal(body.length, 5);
  });
});
