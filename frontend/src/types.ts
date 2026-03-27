export type DataPoint = {
  machineId: string;
  timestamp: string;
  rpm: number;
  temperature: number;
  status: "RUNNING" | "ALERT";
  alert?: { type: string; level: string };
};

export type Alarm = {
  machineId: string;
  timestamp: string;
  rpm: number;
  temperature: number;
  alert: { type: string; level: string };
};
