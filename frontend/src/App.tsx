import { useWebSocket } from "./hooks/useWebSocket";
import { useAlarms } from "./hooks/useAlarms";
import { AlertBanner } from "./components/AlertBanner";
import { TelemetryDisplay } from "./components/TelemetryDisplay";
import { MetricChart } from "./components/MetricChart";
import { AlarmTable } from "./components/AlarmTable";
import { RPM_THRESHOLD, TEMP_THRESHOLD } from "./constants";

const host = location.hostname === "localhost" ? "localhost" : "backend";
const WS_URL = `ws://${host}:4000`;
const API_URL = `http://${host}:4000/api/alarms`;

export default function App() {
  const { data, connected } = useWebSocket(WS_URL);
  const { alarms } = useAlarms(API_URL);

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: 16, fontSize: "1.5rem" }}>
        Manufacturing Dashboard
      </h1>

      <AlertBanner alert={data?.alert ?? null} />

      <TelemetryDisplay data={data} connected={connected} />

      <div style={{ marginBottom: 24 }}>
        <MetricChart
          value={data?.rpm ?? null}
          timestamp={data?.timestamp ?? null}
          threshold={RPM_THRESHOLD}
          label="RPM"
          overColor="#dc2626"
          underColor="#16a34a"
          overBg="rgba(220,38,38,0.10)"
          underBg="rgba(22,163,74,0.10)"
          height={340}
        />
      </div>

      <MetricChart
        value={data?.temperature ?? null}
        timestamp={data?.timestamp ?? null}
        threshold={TEMP_THRESHOLD}
        label="Temperature"
        overColor="#f59e0b"
        underColor="#3b82f6"
        overBg="rgba(245,158,11,0.10)"
        underBg="rgba(59,130,246,0.10)"
        height={300}
        unit="°C"
      />

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Recent Alarms</h2>
        <AlarmTable alarms={alarms} />
      </section>
    </main>
  );
}
