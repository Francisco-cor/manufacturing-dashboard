/**
 * Minimal structured logger.
 * Outputs newline-delimited JSON so log shippers (Loki, CloudWatch, etc.)
 * can parse it without configuration.
 */
export function log(level, msg, data = {}) {
  console.log(JSON.stringify({ level, msg, ts: new Date().toISOString(), ...data }));
}

export function logError(msg, err, data = {}) {
  console.error(
    JSON.stringify({
      level: 'error',
      msg,
      ts: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
      ...data,
    })
  );
}
