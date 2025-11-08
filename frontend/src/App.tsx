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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const host = location.hostname === "localhost" ? "localhost" : "backend";
    const ws = new WebSocket(`ws://${host}:4000`);
    ws.onmessage = (e) => {
      const msg: DataPoint = JSON.parse(e.data);
      setData(msg);
      if (chartRef.current) {
        const chart = chartRef.current;
        chart.data.labels?.push(msg.timestamp.slice(11, 19));
        (chart.data.datasets[0].data as number[]).push(msg.rpm);
        if ((chart.data.labels as string[]).length > 20) {
          (chart.data.labels as string[]).shift();
          (chart.data.datasets[0].data as number[]).shift();
        }
        chart.update();
      }
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (canvasRef.current && !chartRef.current) {
      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data: { labels: [], datasets: [{ label: "RPM", data: [], borderWidth: 2 }] },
        options: { animation: false }
      });
    }
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ marginBottom: 8 }}>Manufacturing Dashboard</h1>
      {data ? (
        <section style={{ marginBottom: 16 }}>
          <div>Machine: <b>{data.machineId}</b></div>
          <div>RPM: <b>{data.rpm.toFixed(1)}</b></div>
          <div>Temperature: <b>{data.temperature.toFixed(1)} °C</b></div>
          <div>Status: <b style={{ color: data.status === "ALERT" ? "red" : "inherit" }}>{data.status}</b></div>
          {data.alert && <div style={{ color: "red" }}>⚠️ Alert: {data.alert.type} — {data.alert.level}</div>}
        </section>
      ) : <p>Waiting for data…</p>}
      <canvas ref={canvasRef} width={800} height={320} />
    </main>
  );
}
