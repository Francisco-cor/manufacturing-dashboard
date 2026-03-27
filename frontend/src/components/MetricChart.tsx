import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { ScriptableLineSegmentContext } from "chart.js";
import { WINDOW } from "../constants";

interface MetricChartProps {
  value: number | null;
  timestamp: string | null;
  threshold: number;
  label: string;
  overColor: string;
  underColor: string;
  overBg: string;
  underBg: string;
  height?: number;
  unit?: string;
}

function overUnder(thr: number, over: string, under: string) {
  return (ctx: ScriptableLineSegmentContext): string => {
    const y0 = ctx.p0.parsed.y ?? null;
    const y1 = ctx.p1.parsed.y ?? null;
    if (y0 === null || y1 === null) return under;
    return y0 >= thr && y1 >= thr ? over : under;
  };
}

function trim<T>(arr: T[]): void {
  while (arr.length > WINDOW) arr.shift();
}

/**
 * Inserts a crossing point at the exact threshold boundary so segment
 * coloring changes precisely where the signal crosses the threshold.
 */
function maybeInsertCrossing(
  times: number[],
  labels: string[],
  values: number[],
  t1: number,
  label1: string,
  y1: number,
  threshold: number
): void {
  const len = values.length;
  if (len === 0) {
    times.push(t1);
    labels.push(label1);
    values.push(y1);
    return;
  }

  const y0 = values[len - 1];
  const t0 = times[len - 1];
  const crosses = (y0 - threshold) * (y1 - threshold) < 0;

  if (!crosses) {
    times.push(t1);
    labels.push(label1);
    values.push(y1);
    return;
  }

  // Linear interpolation: find the exact crossing time
  const r = (threshold - y0) / (y1 - y0);
  const tc = t0 + r * (t1 - t0);
  const labelCross = new Date(tc).toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  times.push(tc);
  labels.push(labelCross);
  values.push(threshold);
  times.push(t1);
  labels.push(label1);
  values.push(y1);
}

/**
 * A self-contained line chart for a single metric.
 * Maintains its own rolling buffer and renders via Chart.js.
 */
export function MetricChart({
  value,
  timestamp,
  threshold,
  label,
  overColor,
  underColor,
  overBg,
  underBg,
  height = 300,
  unit = "",
}: MetricChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const timesRef = useRef<number[]>([]);
  const labelsRef = useRef<string[]>([]);
  const valuesRef = useRef<number[]>([]);

  // Initialize chart once
  useEffect(() => {
    if (!canvasRef.current || chartRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label,
            data: [],
            segment: {
              borderColor: overUnder(threshold, overColor, underColor),
              backgroundColor: overUnder(threshold, overBg, underBg),
            },
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0,
            spanGaps: true,
            order: 2,
          },
          {
            label: `${label} threshold`,
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

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
      timesRef.current = [];
      labelsRef.current = [];
      valuesRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push new data point into the rolling buffer and update chart
  useEffect(() => {
    if (value === null || timestamp === null || !chartRef.current) return;

    const t1 = new Date(timestamp).getTime();
    const label1 = timestamp.slice(11, 19);

    maybeInsertCrossing(
      timesRef.current,
      labelsRef.current,
      valuesRef.current,
      t1,
      label1,
      value,
      threshold
    );
    trim(timesRef.current);
    trim(labelsRef.current);
    trim(valuesRef.current);

    const c = chartRef.current;
    c.data.labels = [...labelsRef.current];
    c.data.datasets[0].data = [...valuesRef.current];
    c.data.datasets[1].data = new Array(labelsRef.current.length).fill(threshold);
    c.update();
  }, [value, timestamp, threshold]);

  return (
    <div>
      <div style={{ height }}>
        <canvas ref={canvasRef} />
      </div>
      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
        {label} — threshold: {threshold.toLocaleString()}
        {unit ? ` ${unit}` : ""}
      </div>
    </div>
  );
}
