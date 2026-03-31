import { prisma } from "@/lib/db";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import HomeHero from "./HomeHero";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories, siteImages] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: 9,
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { active: true } } } } },
    }),
    prisma.siteImage.findMany(),
  ]);

  const img = (key: string) => siteImages.find((i) => i.key === key)?.url || null;

  return (
    <>
      <Nav />
      <HomeHero imageUrl={img("hero")} />

      {/* Wave divider */}
      <svg viewBox="0 0 1440 52" fill="none" preserveAspectRatio="none" style={{ width: "100%", display: "block", marginTop: -1 }}>
        <path d="M0 0 L0 26 Q180 52 360 26 Q540 0 720 26 Q900 52 1080 26 Q1260 0 1440 26 L1440 0Z" fill="var(--navy)" />
        <path d="M0 26 Q180 52 360 26 Q540 0 720 26 Q900 52 1080 26 Q1260 0 1440 26" stroke="var(--cornflower)" strokeWidth="1.2" strokeDasharray="6 8" fill="none" className="stitch-animate" />
      </svg>

      {/* Products */}
      <section style={{ padding: "clamp(60px,8vw,120px) clamp(16px,3vw,40px)" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(48px,5vw,72px)" }}>
          <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--cornflower)", display: "block", marginBottom: 14 }}>The Collection</span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(34px,4.5vw,56px)", fontWeight: 400, lineHeight: 1.1 }}>
            Every piece, <em style={{ fontStyle: "italic", color: "var(--ocean)" }}>one of one</em>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              subtitle={p.subtitle}
              price={p.price}
              category={p.category.name}
              imageUrl={p.images[0]?.url}
              badge={p.badge}
            />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 36px", background: "var(--ink)", color: "white", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            View All Products
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: "clamp(60px,8vw,110px) clamp(16px,3vw,40px)", background: "var(--white)" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(36px,4vw,56px)" }}>
          <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--cornflower)", display: "block", marginBottom: 14 }}>Browse</span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px,3.5vw,48px)", fontWeight: 400, lineHeight: 1.15 }}>
            Shop by <em style={{ fontStyle: "italic", color: "var(--ocean)" }}>category</em>
          </h2>
        </div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", maxWidth: 920, margin: "0 auto" }}>
          {categories.filter(c => c._count.products > 0).map((cat) => (
            <Link key={cat.id} href={"/shop/" + cat.slug} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px 12px 12px", background: "var(--cream)", border: "1px solid transparent", cursor: "pointer" }}>
              <div style={{ width: 40, height: 40, background: "var(--cornflower)", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 400 }}>{cat.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 300 }}>
                  {cat._count.products} {cat._count.products === 1 ? "piece" : "pieces"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Maker section */}
      <section style={{ background: "var(--sand)", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "60vh" }}>
          <div style={{ background: "linear-gradient(135deg, var(--sky-pale), var(--linen))", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, position: "relative", overflow: "hidden" }}>
            {img("maker") ? (
              <Image src={img("maker")!} alt="Emily at Nankilly Farm" fill style={{ objectFit: "cover" }} sizes="50vw" />
            ) : (
              <span style={{ fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Emily photo</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(40px,5vw,80px) clamp(28px,4vw,64px)" }}>
            <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--cornflower)", marginBottom: 20, display: "block" }}>The Maker</span>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(22px,2.5vw,30px)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.55, marginBottom: 28, position: "relative", paddingLeft: 24 }}>
              <div style={{ position: "absolute", left: 0, top: 6, width: 2, height: "calc(100% - 12px)", background: "var(--blush)" }} />
              Each piece starts with a fabric that catches my eye and a story that wants to be stitched into something you can hold.
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--ink-soft)", fontWeight: 300, marginBottom: 32, maxWidth: 420 }}>
              Everything is made by hand at Nankilly Farm on the Cornish coast. Liberty prints, Indian hand-block cottons, vintage scraps and coastal stripes brought alive through free motion quilting.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 1, background: "var(--blush)" }} />
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontStyle: "italic" }}>Emily</div>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 300, marginTop: 2 }}>{"Maker & Founder"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bespoke CTA */}
      <section style={{ position: "relative", padding: "clamp(60px,8vw,120px) clamp(16px,3vw,40px)", background: "var(--ocean)", color: "white", overflow: "hidden" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,4vw,64px)", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--petal)", display: "block", marginBottom: 16 }}>Bespoke</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(32px,4vw,52px)", fontWeight: 400, lineHeight: 1.15, marginBottom: 24 }}>
              Make it <em style={{ fontStyle: "italic", color: "var(--petal)" }}>yours</em>
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.9, opacity: 0.7, maxWidth: 420, marginBottom: 36, fontWeight: 300 }}>
              Every piece can be personalised. Names, dates, messages stitched into the fabric. Perfect for christenings, weddings, or just because.
            </p>
            <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 36px", background: "var(--petal)", color: "var(--ink)", fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Enquire
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ aspectRatio: "3/4", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", position: "relative", overflow: "hidden" }}>
              {img("bespoke_1") ? (
                <Image src={img("bespoke_1")!} alt="Bespoke crafting" fill style={{ objectFit: "cover" }} sizes="25vw" />
              ) : "Photo"}
            </div>
            <div style={{ aspectRatio: "3/4", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginTop: 40, position: "relative", overflow: "hidden" }}>
              {img("bespoke_2") ? (
                <Image src={img("bespoke_2")!} alt="Personalised pieces" fill style={{ objectFit: "cover" }} sizes="25vw" />
              ) : "Photo"}
            </div>
          </div>
        </div>
      </section>

      {/* Info strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        {[
          { t: "UK Delivery", d: "Flat rate £5.99 via Royal Mail" },
          { t: "Handmade to Order", d: "Crafted in our coastal studio" },
          { t: "Personalise It", d: "Names & messages stitched in" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "clamp(28px,3vw,44px)", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 400, marginBottom: 6 }}>{item.t}</h3>
            <p style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 300, lineHeight: 1.6 }}>{item.d}</p>
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
}
