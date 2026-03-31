import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductDetail from "./ProductDetail";
import ProductCard from "@/components/ProductCard";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, active: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      sizeOptions: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) notFound();

  const fabrics = product.hasFabricChoice
    ? await prisma.fabric.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } })
    : [];

  const related = await prisma.product.findMany({
    where: { active: true, id: { not: product.id }, categoryId: product.categoryId },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    take: 4,
  });

  // If not enough related from same category, fill with other featured
  const extraNeeded = 4 - related.length;
  const extra = extraNeeded > 0
    ? await prisma.product.findMany({
        where: { active: true, id: { notIn: [product.id, ...related.map(r => r.id)] }, featured: true },
        include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        take: extraNeeded,
      })
    : [];

  const allRelated = [...related, ...extra];

  return (
    <>
      <Nav />
      <section style={{ paddingTop: 60 }}>
        {/* Breadcrumb */}
        <div style={{ padding: "12px clamp(16px,3vw,40px) 0", maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 6, fontSize: 10, color: "var(--ink-soft)", fontWeight: 300 }}>
            <a href="/">Home</a><span style={{ opacity: 0.4 }}>/</span>
            <a href="/shop">Shop</a><span style={{ opacity: 0.4 }}>/</span>
            <a href={"/shop/" + product.category.slug}>{product.category.name}</a><span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: "var(--ink)" }}>{product.name}</span>
          </div>
        </div>

        {/* Product detail - client component */}
        <ProductDetail
          product={{
            id: product.id,
            name: product.name,
            subtitle: product.subtitle,
            slug: product.slug,
            description: product.description,
            price: product.price,
            category: product.category.name,
            hasPersonalisation: product.hasPersonalisation,
            personalisationPrice: product.personalisationPrice,
            personalisationNote: product.personalisationNote,
            personalisationMaxChars: product.personalisationMaxChars,
            hasFabricChoice: product.hasFabricChoice,
            fabricNote: product.fabricNote,
            hasSizeOptions: product.hasSizeOptions,
            details: product.details as { label: string; value: string }[] | null,
            badge: product.badge,
            inStock: product.inStock,
            images: product.images.map(i => ({ url: i.url, alt: i.alt })),
            sizeOptions: product.sizeOptions.map(s => ({ label: s.label, dimensions: s.dimensions, priceAdd: s.priceAdd })),
          }}
          fabrics={fabrics.map(f => ({ id: f.id, name: f.name, hex: f.hex, pattern: f.pattern, story: f.story }))}
        />
      </section>

      {/* Related */}
      {allRelated.length > 0 && (
        <section style={{ padding: "clamp(32px,4vw,56px) clamp(16px,3vw,40px) clamp(60px,6vw,100px)", borderTop: "1px solid rgba(0,0,0,0.04)", maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ marginBottom: "clamp(24px,3vw,40px)" }}>
            <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--cornflower)", display: "block", marginBottom: 10 }}>More to discover</span>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(22px,2.5vw,32px)", fontWeight: 400 }}>
              From the <em style={{ fontStyle: "italic", color: "var(--ocean)" }}>same hands</em>
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {allRelated.map(p => (
              <ProductCard key={p.id} slug={p.slug} name={p.name} subtitle={p.subtitle} price={p.price} category={p.category.name} imageUrl={p.images[0]?.url} badge={p.badge} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
