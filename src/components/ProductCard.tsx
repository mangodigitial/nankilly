"use client";

import Link from "next/link";
import Image from "next/image";

const catColors: Record<string, string> = {
  Cushions: "#E0A4A0",
  "Fabric Pots": "#6B9FCC",
  Pouches: "#A8CDE0",
  Bags: "#D4789A",
  Bunting: "#F2D1CE",
  Washbags: "#F0E6D8",
  Toys: "#D6E8F0",
  Scents: "#F5EFE6",
};

interface Props {
  slug: string;
  name: string;
  subtitle?: string | null;
  price: number; // pence
  category: string;
  imageUrl?: string | null;
  badge?: string | null;
}

export default function ProductCard({ slug, name, subtitle, price, category, imageUrl, badge }: Props) {
  return (
    <Link href={"/product/" + slug} style={{ display: "block", cursor: "pointer" }}>
      {/* Category tab */}
      <div style={{ height: 3, background: catColors[category] || "var(--sand)" }} />

      {/* Image */}
      <div
        style={{
          aspectRatio: "1",
          background: "linear-gradient(135deg, var(--sky-pale), var(--linen))",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 50vw, 25vw" />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
            Photo
          </div>
        )}
        {badge && (
          <span style={{ position: "absolute", top: 12, left: 12, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "4px 10px", background: "var(--white)", color: "var(--ocean)", fontWeight: 500 }}>
            {badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 4px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-soft)", fontWeight: 300, marginBottom: 3 }}>
          {category}
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 400, lineHeight: 1.3, marginBottom: 2 }}>
          {name}
        </div>
        {subtitle && (
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 12, fontStyle: "italic", color: "var(--ink-soft)", marginBottom: 4 }}>
            {subtitle}
          </div>
        )}
        <span style={{ fontSize: 13, color: "var(--ocean)" }}>
          {"£" + (price / 100).toFixed(2)}
        </span>
      </div>
    </Link>
  );
}
