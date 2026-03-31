"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomeHero({ imageUrl }: { imageUrl?: string | null }) {
  return (
    <section style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "flex-end", overflow: "hidden", background: "var(--navy)" }}>
      {imageUrl ? (
        <Image src={imageUrl} alt="Nankilly Farm" fill style={{ objectFit: "cover" }} priority />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, var(--navy) 0%, var(--ocean-deep) 35%, var(--ocean) 65%, var(--cornflower) 100%)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,58,82,0.9) 0%, rgba(28,58,82,0.3) 35%, transparent 65%)" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", padding: "0 clamp(16px,4vw,48px) clamp(60px,10vh,120px)" }}>
        <div style={{ display: "inline-block", fontSize: 10, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--sky)", marginBottom: 28, padding: "8px 18px", border: "1px solid rgba(168,205,224,0.2)" }}>
          Nankilly Farm - Cornwall
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(56px,9vw,120px)", fontWeight: 400, lineHeight: 0.92, color: "white", marginBottom: 32, maxWidth: 850 }}>
          Stitched<br />
          <span style={{ color: "var(--petal)", fontStyle: "italic" }}>by the sea</span>
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,0.55)", maxWidth: 460, fontWeight: 300, marginBottom: 40 }}>
          Handcrafted luxury gifts from our Cornish coast studio. Liberty prints, vintage fabrics, and free motion quilting.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "17px 40px", background: "var(--blush)", color: "var(--ink)", fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            {"Shop the Collection ->"}
          </Link>
          <Link href="/about" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "17px 40px", background: "none", color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase" as const, border: "1px solid rgba(255,255,255,0.15)" }}>
            Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}
