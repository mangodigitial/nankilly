import { prisma } from "@/lib/db";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const metadata = { title: "Our Story - Nankilly" };

export default async function AboutPage() {
  const aboutImage = await prisma.siteImage.findUnique({ where: { key: "about_hero" } });

  return (
    <>
      <Nav />
      <section style={{ paddingTop: 60 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "85vh" }}>
          <div style={{ background: "linear-gradient(145deg, var(--sky-pale), var(--linen), var(--sand))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 500, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: 80, background: "var(--blush)", zIndex: 1 }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: 80, height: 4, background: "var(--blush)", zIndex: 1 }} />
            {aboutImage?.url ? (
              <Image src={aboutImage.url} alt={aboutImage.alt || "Emily at Nankilly Farm"} fill style={{ objectFit: "cover" }} sizes="50vw" priority />
            ) : (
              <span style={{ fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Emily at Nankilly Farm</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(40px,5vw,80px) clamp(28px,4vw,64px)" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cornflower)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 24, height: 1, background: "var(--cornflower)", display: "inline-block" }} />
              Our Story
            </div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 28 }}>
              {"Handmade gifts, "}
              <em style={{ fontStyle: "italic", color: "var(--ocean)" }}>inspired by Cornwall</em>
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.95, color: "var(--ink-mid)", fontWeight: 300, marginBottom: 24 }}>
              Nankilly is a brand offering handmade gifts, accessories and homeware inspired by a passion for fabrics and the Cornish landscape. Everything is hand sewn by Emily from her home at Nankilly Farm in Cornwall.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.95, color: "var(--ink-mid)", fontWeight: 300 }}>
              Every piece is unique and can be personalised to you or your loved one to create a gift that is truly special.
            </p>
          </div>
        </div>
      </section>

      <section style={{ background: "var(--sand)", padding: "clamp(48px,6vw,88px) clamp(16px,3vw,40px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--cornflower)", display: "block", marginBottom: 14 }}>The Fabrics</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px,3vw,38px)", fontWeight: 400 }}>
              {"A love of "}<em style={{ fontStyle: "italic", color: "var(--ocean)" }}>beautiful materials</em>
            </h2>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.95, color: "var(--ink-mid)", fontWeight: 300, textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            Emily loves the nostalgia of timeless Liberty prints, the unique artisan appeal of Indian hand-block cottons, and the classic coastal vibe of a blue and white stripe. She combines gorgeous new finds with stunning vintage scraps, passed on by her mother and grandmother, to create beautiful products designed to be treasured.
          </p>
        </div>
      </section>

      <section style={{ padding: "clamp(48px,6vw,88px) clamp(16px,3vw,40px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--cornflower)", display: "block", marginBottom: 14 }}>The Craft</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px,3vw,38px)", fontWeight: 400 }}>
              {"Free motion "}<em style={{ fontStyle: "italic", color: "var(--ocean)" }}>stitch drawing</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            {[
              { title: "Hand Cut", desc: "Every piece is individually cut and composed. No patterns, no mass production.", bg: "var(--sky-pale)", col: "var(--ink)" },
              { title: "Stitch Drawn", desc: "Waves, wildflowers, surfers. Each design drawn freehand through the needle.", bg: "var(--navy)", col: "white" },
              { title: "Personalised", desc: "Names, dates, messages. Stitched into the fabric to make it truly yours.", bg: "var(--petal)", col: "var(--ink)" },
            ].map((v, i) => (
              <div key={v.title} style={{ padding: "clamp(28px,3vw,44px)", background: v.bg, color: v.col, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 48, fontWeight: 300, opacity: 0.1, lineHeight: 1, marginBottom: 16 }}>{"0" + (i + 1)}</div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, fontWeight: 300, opacity: 0.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--navy)", color: "white", padding: "clamp(48px,6vw,88px) clamp(16px,3vw,40px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--petal)", display: "block", marginBottom: 14 }}>Beyond the Studio</span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px,3vw,38px)", fontWeight: 400, marginBottom: 28 }}>
            {"Life at "}<em style={{ fontStyle: "italic", color: "var(--petal)" }}>Nankilly Farm</em>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.95, color: "rgba(255,255,255,0.55)", fontWeight: 300, marginBottom: 36 }}>
            When not sewing, Emily keeps busy being mum to her two young boys, working part time in marketing, and running the holiday accommodation at the Farm. Fancy staying? We would love to have you.
          </p>
          <a href="https://www.nankillyfarm.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 34px", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Visit Nankilly Farm
          </a>
        </div>
      </section>

      <section style={{ padding: "clamp(48px,6vw,80px) clamp(16px,3vw,40px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Link href="/shop" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(32px,4vw,56px)", background: "var(--cream)", border: "1px solid rgba(0,0,0,0.04)", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, marginBottom: 8 }}>Shop the Collection</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 300 }}>Browse all handmade pieces</div>
          </Link>
          <Link href="/contact" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(32px,4vw,56px)", background: "var(--cream)", border: "1px solid rgba(0,0,0,0.04)", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, marginBottom: 8 }}>Get in Touch</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 300 }}>emily@nankilly.com</div>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
