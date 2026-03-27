import type { DataPoint } from "../types";

interface TelemetryDisplayProps {
  data: DataPoint | null;
  connected: boolean;
}

export function TelemetryDisplay({ data, connected }: TelemetryDisplayProps) {
  if (!data) {
    return (
      <p style={{ color: connected ? "#9ca3af" : "#f87171" }}>
        {connected ? "Waiting for telemetry data…" : "Reconnecting to server…"}
      </p>
    );
  }

  return (
    <section style={{ marginBottom: 16 }}>
      <p>
        <b>Machine:</b> {data.machineId}
      </p>
      <p>
        <b>RPM:</b> {data.rpm.toFixed(1)} | <b>Temperature:</b>{" "}
        {data.temperature.toFixed(1)} °C
      </p>
      <p>
        <b>Status:</b>{" "}
        <span
          style={{
            color: data.status === "ALERT" ? "#f87171" : "#34d399",
            fontWeight: 600,
          }}
        >
          {data.status}
        </span>
      </p>
    </section>
  );
}
