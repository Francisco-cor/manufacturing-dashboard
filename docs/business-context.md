# Business Context — Manufacturing

This dashboard models a lightweight SCADA-like panel for a CNC or assembly line station.

- **KPIs modeled:** Spindle RPM (speed/load proxy) and motor Temperature (thermal stress proxy).
- **Why real-time?** Line supervisors need immediate visual cues for spikes/overheats to prevent scrap and unplanned downtime.
- **Server-side intelligence:** Alert rules run on the backend to keep a single source of truth and enable headless consumers (e.g., mobile ops, alerting bots).

## Alert Rules
- **HighRPM:** `rpm >= ALERT_RPM` (default 6000)
- **Overheat:** `temperature >= ALERT_TEMP` (default 90°C)
- **Level:** `CRITICAL` (demo)
- **History:** last `ALARM_BUFFER` items, in-memory ring buffer.

## From Demo to Plant
- Replace simulator with **OPC-UA** / **Modbus TCP** client to query PLC registers.
- Add durable store (e.g., PostgreSQL/TimescaleDB) for long-term telemetry & alarms.
- Add auth (JWT) and RBAC for roles: Operator / Supervisor / Maintenance.
- Ship metrics to Prometheus / Grafana for plant-wide views.
