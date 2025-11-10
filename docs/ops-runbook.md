# Ops Runbook — Troubleshooting

## Local Dev
- **PowerShell `&&`**: Use `;` or run commands on separate lines.
- **Frontend canvas warning in tests**: jsdom lacks real canvas. Harmless. Keep tests focused on DOM.
- **Vitest + jest-dom**: Use preset `@testing-library/jest-dom/vitest` in `src/test/setup.ts`.

## CI (GitHub Actions)
- **Rollup optional deps on Linux**: Regenerate lock in runner before build:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
  Then `npm run build`.

## Docker
- **Healthchecks**: Frontend waits for backend `service_healthy`. Validate with:
  ```bash
  docker ps --format "table {{.Names}}	{{.Status}}"
  ```
- **Logs**:
  ```bash
  docker compose logs -f backend
  docker compose logs -f frontend
  ```

## Threshold Tuning
- Edit backend `.env`:
  ```ini
  ALERT_RPM=6200
  ALERT_TEMP=92
  ```
  Restart backend container.
