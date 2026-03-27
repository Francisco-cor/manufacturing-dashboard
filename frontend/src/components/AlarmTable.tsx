import type { Alarm } from "../types";

interface AlarmTableProps {
  alarms: Alarm[];
}

export function AlarmTable({ alarms }: AlarmTableProps) {
  if (alarms.length === 0) {
    return <p style={{ color: "#9ca3af" }}>No alerts registered.</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <caption className="sr-only">Recent machine alarms</caption>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "1px solid #334155" }}>
          <th scope="col" style={{ padding: "6px 8px" }}>Time</th>
          <th scope="col" style={{ padding: "6px 8px" }}>Type</th>
          <th scope="col" style={{ padding: "6px 8px" }}>RPM</th>
          <th scope="col" style={{ padding: "6px 8px" }}>Temp °C</th>
          <th scope="col" style={{ padding: "6px 8px" }}>Level</th>
        </tr>
      </thead>
      <tbody>
        {alarms.map((a) => (
          <tr
            key={`${a.machineId}-${a.timestamp}`}
            style={{ borderBottom: "1px solid #1e293b" }}
          >
            <td style={{ padding: "6px 8px", color: "#9ca3af" }}>
              {a.timestamp.slice(11, 19)}
            </td>
            <td style={{ padding: "6px 8px" }}>{a.alert.type}</td>
            <td style={{ padding: "6px 8px" }}>{a.rpm.toFixed(1)}</td>
            <td style={{ padding: "6px 8px" }}>{a.temperature.toFixed(1)}</td>
            <td
              style={{
                padding: "6px 8px",
                fontWeight: 700,
                color: a.alert.level === "CRITICAL" ? "#f87171" : "#facc15",
              }}
            >
              {a.alert.level}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
