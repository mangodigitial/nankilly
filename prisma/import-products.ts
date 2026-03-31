import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

interface RawProduct {
  name: string;
  subtitle: string | null;
  slug: string;
  price: number;
  category: string;
  inStock: boolean;
  outOfStock?: boolean;
  image: string;
  imageThumb: string;
}

// Special config overrides keyed by slug
const overrides: Record<string, Partial<{
  featured: boolean;
  badge: string;
  description: string;
  hasPersonalisation: boolean;
  personalisationPrice: number;
  personalisationNote: string;
  personalisationMaxChars: number;
  hasFabricChoice: boolean;
  fabricNote: string;
  hasSizeOptions: boolean;
  sizeOptions: { label: string; dimensions: string; priceAdd: number; sortOrder: number }[];
}>> = {
  // Cushions with full options
  "flower-jug-cushion-peonies-forget-me-nots": {
    featured: true,
    badge: "New",
    hasPersonalisation: true,
    personalisationPrice: 500,
    personalisationNote: "Add a name, date or message up to 25 characters",
    personalisationMaxChars: 25,
    hasFabricChoice: true,
    fabricNote: "Choose the backing fabric for your cushion",
    hasSizeOptions: true,
    sizeOptions: [
      { label: "Standard", dimensions: "45x45cm", priceAdd: 0, sortOrder: 0 },
      { label: "Large", dimensions: "55x55cm", priceAdd: 1200, sortOrder: 1 },
      { label: "Lumbar", dimensions: "30x50cm", priceAdd: 500, sortOrder: 2 },
    ],
  },
  "flower-jug-cushion-daffodils-lily-of-the-valley": {
    featured: true,
    badge: "New",
    hasPersonalisation: true,
    personalisationPrice: 500,
    personalisationNote: "Add a name, date or message up to 25 characters",
    personalisationMaxChars: 25,
    hasFabricChoice: true,
    fabricNote: "Choose the backing fabric for your cushion",
    hasSizeOptions: true,
    sizeOptions: [
      { label: "Standard", dimensions: "45x45cm", priceAdd: 0, sortOrder: 0 },
      { label: "Large", dimensions: "55x55cm", priceAdd: 1200, sortOrder: 1 },
      { label: "Lumbar", dimensions: "30x50cm", priceAdd: 500, sortOrder: 2 },
    ],
  },
  // Cushions with personalisation only
  "glamping-cushion": {
    hasPersonalisation: true,
    personalisationPrice: 500,
  },
  "surfer-boy-pillow": {
    hasPersonalisation: true,
    personalisationPrice: 500,
    featured: true,
  },
  "surfer-girl-pillow": {
    hasPersonalisation: true,
    personalisationPrice: 500,
    featured: true,
  },
  // Pouches with personalisation
  "divers-pouch": {
    hasPersonalisation: true,
    personalisationPrice: 500,
    featured: true,
    description: "Handmade quilted pouch with stitch drawn free motion waves and applique divers. Blue and white ticking stripe back with waterproof lining. Approx 23cm W x 15cm H.",
  },
  "paddleboarder-pouch": {
    hasPersonalisation: true,
    personalisationPrice: 500,
  },
  "surfer-pouch": {
    hasPersonalisation: true,
    personalisationPrice: 500,
  },
  // Fabric Pots with personalisation
  "wakeboarding-fabric-pot": {
    hasPersonalisation: true,
    personalisationPrice: 500,
    featured: true,
  },
  "paddleboarder-fabric-pot": {
    hasPersonalisation: true,
    personalisationPrice: 500,
  },
  "surfer-fabric-pot": {
    hasPersonalisation: true,
    personalisationPrice: 500,
    featured: true,
  },
  // Bunting with size options
  "personalised-childs-bunting": {
    hasPersonalisation: true,
    personalisationPrice: 0,
    hasSizeOptions: true,
    sizeOptions: [
      { label: "5 Letters", dimensions: "35cm", priceAdd: 0, sortOrder: 0 },
      { label: "6 Letters", dimensions: "35cm", priceAdd: 300, sortOrder: 1 },
      { label: "7 Letters", dimensions: "35cm", priceAdd: 600, sortOrder: 2 },
      { label: "8 Letters", dimensions: "35cm", priceAdd: 900, sortOrder: 3 },
      { label: "9 Letters", dimensions: "35cm", priceAdd: 1200, sortOrder: 4 },
      { label: "10 Letters", dimensions: "35cm", priceAdd: 1600, sortOrder: 5 },
    ],
  },
  // Washbags
  "mine-washbag": {
    hasPersonalisation: true,
    personalisationPrice: 0,
  },
};

async function main() {
  const raw = JSON.parse(readFileSync(join(__dirname, "..", "nankilly-products.json"), "utf-8"));
  const products: RawProduct[] = raw.products;

  console.log(`Importing ${products.length} products...\n`);

  // Delete the 3 sample products from seed if they exist
  const sampleSlugs = ["flower-jug-cushion-peonies", "surfer-fabric-pot", "divers-pouch"];
  for (const slug of sampleSlugs) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.sizeOption.deleteMany({ where: { productId: existing.id } });
      await prisma.orderItem.deleteMany({ where: { productId: existing.id } });
      await prisma.product.delete({ where: { slug } });
      console.log(`Deleted sample product: ${slug}`);
    }
  }

  let count = 0;

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { name: p.category } });
    if (!category) {
      console.error(`Category not found: ${p.category} — skipping ${p.name}`);
      continue;
    }

    const ov = overrides[p.slug] || {};

    const productData = {
      name: p.name,
      subtitle: p.subtitle,
      price: p.price,
      categoryId: category.id,
      inStock: p.inStock,
      active: p.outOfStock ? false : true,
      featured: ov.featured ?? false,
      badge: ov.badge ?? null,
      description: ov.description ?? null,
      hasPersonalisation: ov.hasPersonalisation ?? false,
      personalisationPrice: ov.personalisationPrice ?? 500,
      personalisationNote: ov.personalisationNote ?? null,
      personalisationMaxChars: ov.personalisationMaxChars ?? 25,
      hasFabricChoice: ov.hasFabricChoice ?? false,
      fabricNote: ov.fabricNote ?? null,
      hasSizeOptions: ov.hasSizeOptions ?? false,
    };

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: productData,
      create: { slug: p.slug, ...productData },
    });

    // Clean up existing images and size options for idempotent re-runs
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.sizeOption.deleteMany({ where: { productId: product.id } });

    // Create product image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: p.image,
        alt: p.name,
        sortOrder: 0,
      },
    });

    // Create size options if specified
    if (ov.sizeOptions) {
      for (const so of ov.sizeOptions) {
        await prisma.sizeOption.create({
          data: { productId: product.id, ...so },
        });
      }
    }

    count++;
    const catSlug = p.category.toLowerCase();
    const flags: string[] = [];
    if (ov.featured) flags.push("featured");
    if (ov.hasPersonalisation) flags.push("personalisation");
    if (ov.hasFabricChoice) flags.push("fabric");
    if (ov.hasSizeOptions) flags.push("sizes");
    if (p.outOfStock) flags.push("inactive");
    const flagStr = flags.length ? ` [${flags.join(", ")}]` : "";
    console.log(`Created product: ${p.name} (${catSlug})${flagStr}`);
  }

  console.log(`\nDone. ${count} products imported.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
