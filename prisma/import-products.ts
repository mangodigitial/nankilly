import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

interface RawProduct {
  name: string;
  subtitle: string | null;
  slug: string;
  price: number;
  category: string;
  status: string;
  productType: string;
  inStock: boolean;
  description: string;
  images: string[];
  outOfStock?: boolean;
  active?: boolean;
}

// Special config overrides keyed by slug
const overrides: Record<string, Partial<{
  featured: boolean;
  badge: string;
  hasPersonalisation: boolean;
  personalisationPrice: number;
  personalisationNote: string;
  personalisationMaxChars: number;
  hasFabricChoice: boolean;
  fabricNote: string;
  hasSizeOptions: boolean;
  sizeOptions: { label: string; dimensions: string; priceAdd: number; sortOrder: number }[];
}>> = {
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
  "divers-pouch": {
    hasPersonalisation: true,
    personalisationPrice: 500,
    featured: true,
  },
  "paddleboarder-pouch": {
    hasPersonalisation: true,
    personalisationPrice: 500,
  },
  "surfer-pouch": {
    hasPersonalisation: true,
    personalisationPrice: 500,
  },
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
  "mine-washbag": {
    hasPersonalisation: true,
    personalisationPrice: 0,
  },
};

async function uploadToBlob(url: string, slug: string, index: number): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const urlParts = url.split("/");
  const filename = urlParts[urlParts.length - 1];
  const blobPath = `products/${slug}/${index}-${filename}`;

  const blob = await put(blobPath, buffer, { access: "public", contentType });
  return blob.url;
}

async function main() {
  const raw = JSON.parse(readFileSync(join(__dirname, "..", "nankilly-products-full.json"), "utf-8"));
  const products: RawProduct[] = raw.products;

  console.log(`Found ${products.length} products (${raw.published} published, ${raw.draft} draft)\n`);

  // Ensure Christmas category exists for draft products
  await prisma.category.upsert({
    where: { name: "Christmas" },
    update: {},
    create: { name: "Christmas", slug: "christmas", sortOrder: 9 },
  });
  console.log("Ensured Christmas category exists\n");

  // Delete the 3 old sample products from original seed
  const sampleSlugs = ["flower-jug-cushion-peonies", "surfer-fabric-pot", "divers-pouch"];
  for (const slug of sampleSlugs) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.sizeOption.deleteMany({ where: { productId: existing.id } });
      await prisma.orderItem.deleteMany({ where: { productId: existing.id } });
      await prisma.product.delete({ where: { slug } });
      console.log(`Deleted old sample: ${slug}`);
    }
  }

  let count = 0;
  let totalImages = 0;

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { name: p.category } });
    if (!category) {
      console.error(`Category not found: "${p.category}" — skipping ${p.name}`);
      continue;
    }

    const ov = overrides[p.slug] || {};
    const isDraft = p.status === "draft";
    const isActive = p.active === false || p.outOfStock ? false : !isDraft;

    const productData = {
      name: p.name,
      subtitle: p.subtitle,
      description: p.description || null,
      price: p.price,
      categoryId: category.id,
      inStock: p.inStock,
      active: isActive,
      featured: ov.featured ?? false,
      badge: ov.badge ?? null,
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

    // Upload all images to Vercel Blob
    const imageCount = p.images.length;
    for (let i = 0; i < imageCount; i++) {
      try {
        process.stdout.write(`  Uploading image ${i + 1}/${imageCount}...\r`);
        const blobUrl = await uploadToBlob(p.images[i], p.slug, i);
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: blobUrl,
            alt: i === 0 ? p.name : `${p.name} - ${i + 1}`,
            sortOrder: i,
          },
        });
        totalImages++;
      } catch (err) {
        console.error(`  Failed image ${i + 1} for ${p.slug}: ${err}`);
      }
    }

    // Create size options
    if (ov.sizeOptions) {
      for (const so of ov.sizeOptions) {
        await prisma.sizeOption.create({
          data: { productId: product.id, ...so },
        });
      }
    }

    count++;
    const flags: string[] = [];
    if (isDraft) flags.push("draft");
    if (!isActive) flags.push("inactive");
    if (ov.featured) flags.push("featured");
    if (ov.hasPersonalisation) flags.push("personalisation");
    if (ov.hasFabricChoice) flags.push("fabric");
    if (ov.hasSizeOptions) flags.push("sizes");
    const flagStr = flags.length ? ` [${flags.join(", ")}]` : "";
    console.log(`Created: ${p.name} (${p.category.toLowerCase()}) — ${imageCount} images${flagStr}`);
  }

  console.log(`\nDone. ${count} products imported, ${totalImages} images uploaded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
