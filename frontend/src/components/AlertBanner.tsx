interface AlertBannerProps {
  alert: { type: string; level: string } | null;
}

export function AlertBanner({ alert }: AlertBannerProps) {
  if (!alert) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        backgroundColor: "#dc2626",
        color: "white",
        padding: "10px 16px",
        borderRadius: 6,
        marginBottom: 16,
      }}
    >
      ⚠️ ALERT: {alert.type} — Level {alert.level}
    </div>
  );
}
