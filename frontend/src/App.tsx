import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

type DataPoint = {
  machineId: string;
  timestamp: string;
  rpm: number;
  temperature: number;
  status: string;
  alert?: { type: string; level: string };
};

export default function App() {
  const [data, setData] = useState<DataPoint | null>(null);
  const [alert, setAlert] = useState<{ type: string; level: string } | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // WebSocket setup
  useEffect(() => {
    const host = location.hostname === "localhost" ? "localhost" : "backend";
    const ws = new WebSocket(`ws://${host}:4000`);
    ws.onmessage = (e) => {
      const msg: DataPoint = JSON.parse(e.data);
      setData(msg);
      if (msg.alert) setAlert(msg.alert);
      else setAlert(null);

      if (chartInstance.current) {
        const chart = chartInstance.current;
        const ts = msg.timestamp.slice(11, 19);
        const dataset = chart.data.datasets[0].data as number[];
        const labels = chart.data.labels as string[];

        labels.push(ts);
        dataset.push(msg.rpm);
        if (labels.length > 60) {
          labels.shift();
          dataset.shift();
        }
        chart.update();
      }
    };
    return () => ws.close();
  }, []);

  // Chart initialization
  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "RPM",
              data: [],
              borderColor: "#16a34a",
              backgroundColor: "rgba(22,163,74,0.1)",
              borderWidth: 2,
              tension: 0.3,
            },
          ],
        },
        options: {
          animation: false,
          scales: {
            x: { ticks: { color: "#9ca3af" } },
            y: { beginAtZero: true, ticks: { color: "#9ca3af" } },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    }
  }, []);

  // Dynamic color change for alert state
  useEffect(() => {
    if (chartInstance.current) {
      const color = alert ? "#dc2626" : "#16a34a";
      chartInstance.current.data.datasets[0].borderColor = color;
      chartInstance.current.update();
    }
  }, [alert]);

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
      <h1 style={{ marginBottom: 16, fontSize: "1.5rem" }}>Manufacturing Dashboard</h1>

      {alert && (
        <div
          style={{
            backgroundColor: "#dc2626",
            color: "white",
            padding: "10px 16px",
            borderRadius: 6,
            marginBottom: 16,
            animation: "pulse 1s infinite",
          }}
        >
          ⚠️ ALERT: {alert.type} — Level {alert.level}
        </div>
      )}

      {data ? (
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
      ) : (
        <p>Waiting for telemetry data…</p>
      )}

      <canvas ref={chartRef} width="800" height="350" />
    </main>
  );
}
