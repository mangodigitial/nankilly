import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function Footer() {
  const logoImage = await prisma.siteImage.findUnique({ where: { key: "logo_light" } });

  return (
    <footer style={{ background: "var(--navy)", color: "white", padding: "clamp(36px,4vw,56px) clamp(16px,3vw,40px) 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.06)", maxWidth: 1300, margin: "0 auto" }}>
        <div>
          {logoImage?.url ? (
            <img src={logoImage.url} alt="Nankilly" style={{ height: 36, width: "auto", marginBottom: 10 }} />
          ) : (
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 400, marginBottom: 10 }}>Nankilly</div>
          )}
          <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.35)", fontWeight: 300, maxWidth: 240 }}>
            Handcrafted gifts inspired by Cornwall. Made at Nankilly Farm.
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 400, color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>Shop</h4>
          {["Cushions", "Bags", "Pouches", "Fabric Pots", "Bunting"].map((l) => (
            <Link key={l} href={"/shop/" + l.toLowerCase().replace(/ /g, "-")} style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 300, marginBottom: 7 }}>
              {l}
            </Link>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 400, color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>Info</h4>
          {[
            { l: "Our Story", h: "/about" },
            { l: "Delivery", h: "/delivery" },
            { l: "Contact", h: "/contact" },
          ].map((i) => (
            <Link key={i.h} href={i.h} style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 300, marginBottom: 7 }}>
              {i.l}
            </Link>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 400, color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>Contact</h4>
          <a href="mailto:emily@nankilly.com" style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 300, marginBottom: 7 }}>
            emily@nankilly.com
          </a>
          <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 300, marginBottom: 7 }}>Nankilly Farm</span>
          <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>Cornwall, UK</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, maxWidth: 1300, margin: "0 auto" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontWeight: 300 }}>2026 Nankilly</span>
        <a href="https://www.instagram.com/nankilly" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>
          IG
        </a>
      </div>
    </footer>
  );
}
