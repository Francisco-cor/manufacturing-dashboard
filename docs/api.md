# API Reference

## `GET /health`
Health for Docker/CI:
```json
{ "status": "ok", "uptime": 42, "timestamp": "2025-11-10T00:00:00.000Z" }
```

## `GET /api/alarms`
Returns the most recent alerts (ring buffer). Example:
```json
[
  {
    "machineId": "ASSEMBLY-LINE-1",
    "timestamp": "2025-11-10T00:00:07.123Z",
    "rpm": 6421.7,
    "temperature": 95.1,
    "alert": { "type": "Overheat", "level": "CRITICAL" }
  }
]
```

### CORS
Allowed origins can be set via `CORS_ORIGINS` in backend `.env` (comma-separated).
