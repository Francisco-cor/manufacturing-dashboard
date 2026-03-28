import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateMachineData,
  getAlarms,
  pushAlarm,
  clearAlarms,
} from './simulator.js';

const BASE_CFG = { ALERT_RPM: 6000, ALERT_TEMP: 90, ALARM_BUFFER: 100 };

describe('generateMachineData', () => {
  beforeEach(() => clearAlarms());

  test('returns parseable JSON with expected fields', () => {
    const raw = generateMachineData(BASE_CFG);
    const data = JSON.parse(raw);
    assert.equal(data.machineId, 'ASSEMBLY-LINE-1');
    assert.equal(typeof data.rpm, 'number');
    assert.equal(typeof data.temperature, 'number');
    assert.equal(typeof data.timestamp, 'string');
    assert.ok(['RUNNING', 'ALERT'].includes(data.status));
  });

  test('rpm is between 5000 and 7000', () => {
    for (let i = 0; i < 20; i++) {
      const { rpm } = JSON.parse(generateMachineData(BASE_CFG));
      assert.ok(rpm >= 5000 && rpm <= 7000, `rpm ${rpm} out of range`);
    }
  });

  test('temperature is between 70 and 100', () => {
    for (let i = 0; i < 20; i++) {
      const { temperature } = JSON.parse(generateMachineData(BASE_CFG));
      assert.ok(temperature >= 70 && temperature <= 100, `temp ${temperature} out of range`);
    }
  });

  test('status is ALERT when rpm threshold is set impossibly high for temp (force HighRPM)', () => {
    const cfg = { ALERT_RPM: 1, ALERT_TEMP: 9999, ALARM_BUFFER: 100 };
    const data = JSON.parse(generateMachineData(cfg));
    assert.equal(data.status, 'ALERT');
    assert.ok(data.alert, 'alert field must be present');
    assert.equal(data.alert.type, 'HighRPM');
    assert.equal(data.alert.level, 'CRITICAL');
  });

  test('status is RUNNING when both thresholds are above any possible value', () => {
    const cfg = { ALERT_RPM: 9999, ALERT_TEMP: 9999, ALARM_BUFFER: 100 };
    const data = JSON.parse(generateMachineData(cfg));
    assert.equal(data.status, 'RUNNING');
    assert.equal(data.alert, undefined);
  });

  test('ALERT reading is added to the alarm buffer', () => {
    clearAlarms();
    const cfg = { ALERT_RPM: 1, ALERT_TEMP: 9999, ALARM_BUFFER: 100 };
    generateMachineData(cfg);
    assert.equal(getAlarms().length, 1);
  });

  test('RUNNING reading does not touch the alarm buffer', () => {
    clearAlarms();
    const cfg = { ALERT_RPM: 9999, ALERT_TEMP: 9999, ALARM_BUFFER: 100 };
    generateMachineData(cfg);
    assert.equal(getAlarms().length, 0);
  });
});

describe('pushAlarm + ring buffer', () => {
  beforeEach(() => clearAlarms());

  const ALARM = {
    machineId: 'M1', timestamp: 't0', rpm: 1, temperature: 1,
    status: 'ALERT', alert: { type: 'HighRPM', level: 'CRITICAL' },
  };

  test('stores alarms up to bufferSize', () => {
    for (let i = 0; i < 3; i++) pushAlarm({ ...ALARM, timestamp: `t${i}` }, 3);
    assert.equal(getAlarms().length, 3);
  });

  test('evicts the oldest entry when the buffer overflows', () => {
    for (let i = 0; i < 5; i++) pushAlarm({ ...ALARM, timestamp: `t${i}` }, 3);
    const alarms = getAlarms();
    assert.equal(alarms.length, 3);
    assert.equal(alarms[0].timestamp, 't2');
    assert.equal(alarms[2].timestamp, 't4');
  });
});
