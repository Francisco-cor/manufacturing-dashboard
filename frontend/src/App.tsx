import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

type DataPoint = {
  machineId: string;        // e.g. "ASSEMBLY-LINE-1"
  timestamp: string;        // ISO string
  rpm: number;              // e.g. 6123.4
  temperature: number;      // °C
  status: "RUNNING" | "ALERT";
  alert?: { type: string; level: string };
};

type Alarm = {
  machineId: string;
  timestamp: string;
  rpm: number;
  temperature: number;
  alert: { type: string; level: string };
};

const RPM_THRESHOLD = 6000;
const TEMP_THRESHOLD = 90;
const WINDOW = 60;

export default function App() {
  // estado UI
  const [data, setData] = useState<DataPoint | null>(null);
  const [alert, setAlert] = useState<{ type: string; level: string } | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // canvases + chart instances
  const rpmCanvas = useRef<HTMLCanvasElement>(null);
  const tempCanvas = useRef<HTMLCanvasElement>(null);
  const rpmChart = useRef<Chart | null>(null);
  const tempChart = useRef<Chart | null>(null);

  // buffers RPM (labels/tiempos independientes)
  const labelsRpmRef = useRef<string[]>([]);
  const timesRpmRef = useRef<number[]>([]);
  const rpmRef = useRef<number[]>([]);

  // buffers Temp (labels/tiempos independientes)
  const labelsTempRef = useRef<string[]>([]);
  const timesTempRef = useRef<number[]>([]);
  const tempRef = useRef<number[]>([]);

  const trim = (arr: any[]) => { while (arr.length > WINDOW) arr.shift(); };

  // --- segment coloring: rojo/naranja solo si ambos extremos > umbral
  const overUnder = (thr: number, over: string, under: string) => (ctx: any) => {
    const y0 = ctx.p0?.parsed?.y;
    const y1 = ctx.p1?.parsed?.y;
    if (y0 == null || y1 == null) return under;
    return (y0 >= thr && y1 >= thr) ? over : under;
  };

  // --- inserta punto de cruce para cortar el tramo justo en el umbral
  function maybeInsertCrossing(
    times: number[], labels: string[], values: number[],
    t1: number, label1: string, y1: number, threshold: number
  ) {
    const len = values.length;
    if (len === 0) {
      times.push(t1); labels.push(label1); values.push(y1);
      return;
    }
    const y0 = values[len - 1];
    const t0 = times[len - 1];

    const crosses = (y0 - threshold) * (y1 - threshold) < 0;
    if (!crosses) {
      times.push(t1); labels.push(label1); values.push(y1);
      return;
    }

    // y = y0 + r*(y1 - y0) = threshold  => r = (threshold - y0)/(y1 - y0)
    const r = (threshold - y0) / (y1 - y0);
    const tc = t0 + r * (t1 - t0);
    const labelCross = new Date(tc).toLocaleTimeString("en-GB", {
      hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"
    });

    // inserta cruz y luego el punto real
    times.push(tc); labels.push(labelCross); values.push(threshold);
    times.push(t1); labels.push(label1); values.push(y1);
  }

  // ---- WebSocket feed (un solo WS, actualiza ambas series con buffers separados)
  useEffect(() => {
    const host = location.hostname === "localhost" ? "localhost" : "backend";
    const ws = new WebSocket(`ws://${host}:4000`);

    ws.onmessage = (e) => {
      const msg: DataPoint = JSON.parse(e.data);
      setData(msg);
      setAlert(msg.alert ?? null);

      const t1 = new Date(msg.timestamp).getTime();
      const label1 = msg.timestamp.slice(11, 19);

      // RPM: inserción de cruce y actualización de ventana
      maybeInsertCrossing(timesRpmRef.current, labelsRpmRef.current, rpmRef.current,
        t1, label1, msg.rpm, RPM_THRESHOLD);
      trim(timesRpmRef.current); trim(labelsRpmRef.current); trim(rpmRef.current);

      // Temp: inserción de cruce y actualización de ventana
      maybeInsertCrossing(timesTempRef.current, labelsTempRef.current, tempRef.current,
        t1, label1, msg.temperature, TEMP_THRESHOLD);
      trim(timesTempRef.current); trim(labelsTempRef.current); trim(tempRef.current);

      // Actualiza charts
      if (rpmChart.current) {
        const c = rpmChart.current;
        c.data.labels = [...labelsRpmRef.current];
        c.data.datasets[0].data = [...rpmRef.current]; // señal
        c.data.datasets[1].data = new Array(labelsRpmRef.current.length).fill(RPM_THRESHOLD); // guía
        c.update();
      }
      if (tempChart.current) {
        const c = tempChart.current;
        c.data.labels = [...labelsTempRef.current];
        c.data.datasets[0].data = [...tempRef.current];
        c.data.datasets[1].data = new Array(labelsTempRef.current.length).fill(TEMP_THRESHOLD);
        c.update();
      }
    };

    return () => ws.close();
  }, []);

  // ---- Polling de /api/alarms (cada 10 s)
  useEffect(() => {
    const host = location.hostname === "localhost" ? "localhost" : "backend";
    const url = `http://${host}:4000/api/alarms`;

    const tick = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const json: Alarm[] = await res.json();
        setAlarms(json.slice(-100).reverse()); // últimas primero
      } catch { /* ignore */ }
    };

    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // ---- Init charts (1 dataset señal + 1 guía punteada)
  useEffect(() => {
    if (rpmCanvas.current && !rpmChart.current) {
      rpmChart.current = new Chart(rpmCanvas.current, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "RPM",
              data: [],
              segment: {
                borderColor: overUnder(RPM_THRESHOLD, "#dc2626", "#16a34a"),
                backgroundColor: overUnder(RPM_THRESHOLD, "rgba(220,38,38,0.10)", "rgba(22,163,74,0.10)"),
              },
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 0,
              spanGaps: true,
              order: 2,
            },
            {
              label: "RPM threshold",
              data: [],
              borderColor: "rgba(148,163,184,0.5)",
              borderDash: [6, 6],
              pointRadius: 0,
              borderWidth: 1,
              tension: 0,
              spanGaps: true,
              order: 1,
            },
          ],
        },
        options: {
          animation: false,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: "#9ca3af" } },
            y: { ticks: { color: "#9ca3af" } },
          },
        },
      });
    }

    if (tempCanvas.current && !tempChart.current) {
      tempChart.current = new Chart(tempCanvas.current, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Temperature °C",
              data: [],
              segment: {
                borderColor: overUnder(TEMP_THRESHOLD, "#f59e0b", "#3b82f6"),
                backgroundColor: overUnder(TEMP_THRESHOLD, "rgba(245,158,11,0.10)", "rgba(59,130,246,0.10)"),
              },
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 0,
              spanGaps: true,
              order: 2,
            },
            {
              label: "Temp threshold",
              data: [],
              borderColor: "rgba(148,163,184,0.5)",
              borderDash: [6, 6],
              pointRadius: 0,
              borderWidth: 1,
              tension: 0,
              spanGaps: true,
              order: 1,
            },
          ],
        },
        options: {
          animation: false,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: "#9ca3af" } },
            y: { ticks: { color: "#9ca3af" } },
          },
        },
      });
    }

    return () => { rpmChart.current?.destroy(); tempChart.current?.destroy(); };
  }, []);

  return (
    <main style={{
      padding: 24, fontFamily: "system-ui, sans-serif",
      backgroundColor: "#0f172a", color: "#f8fafc", minHeight: "100vh",
    }}>
      <h1 style={{ marginBottom: 16, fontSize: "1.5rem" }}>Manufacturing Dashboard</h1>

      {alert && (
        <div style={{ backgroundColor: "#dc2626", color: "white", padding: "10px 16px", borderRadius: 6, marginBottom: 16 }}>
          ⚠️ ALERT: {alert.type} — Level {alert.level}
        </div>
      )}

      {data ? (
        <section style={{ marginBottom: 16 }}>
          <p><b>Machine:</b> {data.machineId}</p>
          <p><b>RPM:</b> {data.rpm.toFixed(1)} | <b>Temperature:</b> {data.temperature.toFixed(1)} °C</p>
          <p>
            <b>Status:</b>{" "}
            <span style={{ color: data.status === "ALERT" ? "#f87171" : "#34d399", fontWeight: 600 }}>
              {data.status}
            </span>
          </p>
        </section>
      ) : <p>Waiting for telemetry data…</p>}

      <div style={{ height: 340, marginBottom: 24 }}>
        <canvas ref={rpmCanvas} />
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
          RPM — threshold: {RPM_THRESHOLD.toLocaleString()}
        </div>
      </div>

      <div style={{ height: 300 }}>
        <canvas ref={tempCanvas} />
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
          Temperature — threshold: {TEMP_THRESHOLD} °C
        </div>
      </div>

      {/* Tabla de alertas */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Recent Alarms</h2>
        {alarms.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No alerts registered.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #334155" }}>
                <th style={{ padding: "6px 8px" }}>Time</th>
                <th style={{ padding: "6px 8px" }}>Type</th>
                <th style={{ padding: "6px 8px" }}>RPM</th>
                <th style={{ padding: "6px 8px" }}>Temp °C</th>
                <th style={{ padding: "6px 8px" }}>Level</th>
              </tr>
            </thead>
            <tbody>
              {alarms.map((a, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "6px 8px", color: "#9ca3af" }}>{a.timestamp.slice(11, 19)}</td>
                  <td style={{ padding: "6px 8px" }}>{a.alert.type}</td>
                  <td style={{ padding: "6px 8px" }}>{a.rpm.toFixed(1)}</td>
                  <td style={{ padding: "6px 8px" }}>{a.temperature.toFixed(1)}</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, color: a.alert.level === "CRITICAL" ? "#f87171" : "#facc15" }}>
                    {a.alert.level}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
