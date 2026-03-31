import { prisma } from "@/lib/db";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });

  return (
    <>
      <Nav />
      <section style={{ paddingTop: 60 }}>
        <div style={{ padding: "clamp(48px,6vw,80px) clamp(16px,3vw,40px) clamp(28px,3vw,40px)", maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cornflower)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 24, height: 1, background: "var(--cornflower)", display: "inline-block" }} />
            Shop
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px,4vw,46px)", fontWeight: 400, lineHeight: 1.15, marginBottom: 20 }}>
            The <em style={{ fontStyle: "italic", color: "var(--ocean)" }}>Collection</em>
          </h1>

          {/* Category filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <Link href="/shop" style={{ padding: "8px 18px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", border: "1.5px solid var(--ocean)", background: "rgba(58,111,143,0.04)", color: "var(--ocean)", fontWeight: 500 }}>
              All
            </Link>
            {categories.filter(c => c._count.products > 0).map((cat) => (
              <Link key={cat.id} href={"/shop/" + cat.slug} style={{ padding: "8px 18px", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", border: "1.5px solid rgba(0,0,0,0.08)", color: "var(--ink-soft)", fontWeight: 400 }}>
                {cat.name} ({cat._count.products})
              </Link>
            ))}
          </div>
        </div>

        {/* Stitch divider */}
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 clamp(16px,3vw,40px)" }}>
          <svg width="100%" height="8"><line x1="0" y1="4" x2="100%" y2="4" stroke="var(--sky-pale)" strokeWidth="1.5" strokeDasharray="6 8" className="stitch-animate" /></svg>
        </div>

        {/* Product grid */}
        <div style={{ padding: "clamp(28px,3vw,48px) clamp(16px,3vw,40px) clamp(60px,6vw,100px)", maxWidth: 1300, margin: "0 auto" }}>
          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", fontWeight: 300 }}>No products yet. Check back soon.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {products.map((p) => (
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
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
