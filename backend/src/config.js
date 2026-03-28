import 'dotenv/config';

/**
 * Parses and validates a required positive-number env var.
 * Throws a descriptive error on bad input instead of silently producing NaN.
 */
function positiveNumber(name, defaultVal) {
  const raw = process.env[name];
  const val = +(raw ?? defaultVal);
  if (!Number.isFinite(val) || val <= 0) {
    throw new Error(
      `Config: ${name} must be a positive number (got ${JSON.stringify(raw)})`
    );
  }
  return val;
}

/**
 * Parse CORS_ORIGINS csv → string[].
 * Defaults to localhost dev origins so the server is NOT open to all origins
 * when the variable is absent.
 */
function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGINS ?? '';
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  return list.length ? list : ['http://localhost:5173', 'http://localhost:3000'];
}

export const config = {
  PORT:         positiveNumber('PORT',         4000),
  TICK_MS:      positiveNumber('TICK_MS',      3000),
  ALERT_RPM:    positiveNumber('ALERT_RPM',    6000),
  ALERT_TEMP:   positiveNumber('ALERT_TEMP',   90),
  ALARM_BUFFER: positiveNumber('ALARM_BUFFER', 100),
  CORS_ORIGINS: parseCorsOrigins(),
};
