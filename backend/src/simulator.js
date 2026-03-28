/**
 * In-memory alarm ring buffer + telemetry generator.
 * Isolated from transport so it can be tested without Express or WebSockets.
 */

/** @type {{ machineId: string, timestamp: string, rpm: number, temperature: number, status: string, alert: { type: string, level: string } }[]} */
const alarms = [];

/** @returns {readonly typeof alarms} */
export function getAlarms() {
  return alarms;
}

/**
 * Appends an alarm and evicts the oldest entry when the buffer is full.
 * @param {typeof alarms[number]} payload
 * @param {number} bufferSize
 */
export function pushAlarm(payload, bufferSize) {
  alarms.push(payload);
  while (alarms.length > bufferSize) alarms.shift();
}

/**
 * Generates a single telemetry snapshot for the simulated machine.
 * Stores the alarm in the ring buffer if the reading triggers an alert.
 *
 * @param {{ ALERT_RPM: number, ALERT_TEMP: number, ALARM_BUFFER: number }} cfg
 * @returns {string} JSON-serialised DataPoint
 */
export function generateMachineData(cfg) {
  const rpm         = 5000 + Math.random() * 2000;   // 5 000 – 7 000
  const temperature = 70   + Math.random() * 30;     // 70 – 100 °C
  const isAlert     = rpm >= cfg.ALERT_RPM || temperature >= cfg.ALERT_TEMP;

  /** @type {Record<string, unknown>} */
  const payload = {
    machineId:   'ASSEMBLY-LINE-1',
    timestamp:   new Date().toISOString(),
    rpm,
    temperature,
    status: isAlert ? 'ALERT' : 'RUNNING',
  };

  if (isAlert) {
    payload.alert = {
      type:  rpm >= cfg.ALERT_RPM ? 'HighRPM' : 'Overheat',
      level: 'CRITICAL',
    };
    pushAlarm({ ...payload }, cfg.ALARM_BUFFER);
  }

  return JSON.stringify(payload);
}
