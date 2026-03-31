export default function StitchDivider({ color = "var(--sky-pale)", width = "100%" }: { color?: string; width?: string }) {
  return (
    <svg width={width} height="8">
      <line
        x1="0" y1="4" x2="100%" y2="4"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="6 8"
        className="stitch-animate"
      />
    </svg>
  );
}
