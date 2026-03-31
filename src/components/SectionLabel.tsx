export default function SectionLabel({ children, color = "var(--cornflower)", center = false }: { children: React.ReactNode; color?: string; center?: boolean }) {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase" as const,
        color,
        marginBottom: 14,
        fontWeight: 300,
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: center ? "center" : "flex-start",
      }}
    >
      <span style={{ width: 24, height: 1, background: color, display: "inline-block" }} />
      {children}
      {center && <span style={{ width: 24, height: 1, background: color, display: "inline-block" }} />}
    </div>
  );
}
