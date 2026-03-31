import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("changeme123", 12);
  await prisma.adminUser.upsert({
    where: { email: "emily@nankilly.com" },
    update: {},
    create: {
      email: "emily@nankilly.com",
      password: hashedPassword,
      name: "Emily",
    },
  });
  console.log("Admin user created (emily@nankilly.com / changeme123)");

  // Create categories
  const categories = [
    { name: "Cushions", slug: "cushions", sortOrder: 1 },
    { name: "Fabric Pots", slug: "fabric-pots", sortOrder: 2 },
    { name: "Pouches", slug: "pouches", sortOrder: 3 },
    { name: "Bags", slug: "bags", sortOrder: 4 },
    { name: "Bunting", slug: "bunting", sortOrder: 5 },
    { name: "Washbags", slug: "washbags", sortOrder: 6 },
    { name: "Toys", slug: "toys", sortOrder: 7 },
    { name: "Scents", slug: "scents", sortOrder: 8 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categories created");

  // Create fabrics
  const fabrics = [
    { name: "Liberty Betsy", hex: "#D4A0B0", pattern: "floral", story: "Timeless Liberty floral. Soft pinks and dusky roses.", sortOrder: 1 },
    { name: "Liberty Wiltshire", hex: "#7BA3C4", pattern: "floral", story: "Shadow florals in blues and mauves. Iconic.", sortOrder: 2 },
    { name: "Indian Hand-Block", hex: "#C4956B", pattern: "block", story: "Hand-stamped in Rajasthan. Every metre different.", sortOrder: 3 },
    { name: "Coastal Stripe", hex: "#4A7A92", pattern: "stripe", story: "Navy and cream ticking. Harbour walls and deckchairs.", sortOrder: 4 },
    { name: "Vintage Rose", hex: "#C97B7B", pattern: "floral", story: "Reclaimed 1960s dress fabric. Limited run.", sortOrder: 5 },
    { name: "Cornish Blue", hex: "#6B9FCC", pattern: "solid", story: "Quilted cornflower linen. The sea on a good day.", sortOrder: 6 },
  ];

  for (const fab of fabrics) {
    const existing = await prisma.fabric.findFirst({ where: { name: fab.name } });
    if (!existing) {
      await prisma.fabric.create({ data: fab });
    }
  }
  console.log("Fabrics created");

  // Create sample products
  const cushionsCat = await prisma.category.findUnique({ where: { slug: "cushions" } });
  const potsCat = await prisma.category.findUnique({ where: { slug: "fabric-pots" } });
  const pouchesCat = await prisma.category.findUnique({ where: { slug: "pouches" } });

  if (cushionsCat) {
    const existing = await prisma.product.findUnique({ where: { slug: "flower-jug-cushion-peonies" } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: "Flower Jug Cushion",
          subtitle: "Peonies & Forget-Me-Nots",
          slug: "flower-jug-cushion-peonies",
          description: "A hand-quilted cushion featuring a jug of peonies and forget-me-nots, created using free motion stitch drawing. The flowers are composed from Liberty prints and vintage fabric scraps.",
          price: 4500, // pence
          categoryId: cushionsCat.id,
          hasPersonalisation: true,
          personalisationPrice: 500,
          personalisationNote: "Add a name, date, or message (up to 25 characters)",
          hasFabricChoice: true,
          fabricNote: "Choose the backing fabric for your cushion",
          hasSizeOptions: true,
          badge: "New",
          featured: true,
          details: [
            { label: "Size", value: "45 x 45cm" },
            { label: "Filling", value: "Duck-feather pad" },
            { label: "Closure", value: "Concealed zip" },
            { label: "Front", value: "Quilted applique panel" },
            { label: "Back", value: "Coordinating print" },
            { label: "Care", value: "Spot clean" },
          ],
          sizeOptions: {
            create: [
              { label: "Standard", dimensions: "45x45cm", priceAdd: 0, sortOrder: 0 },
              { label: "Large", dimensions: "55x55cm", priceAdd: 1200, sortOrder: 1 },
              { label: "Lumbar", dimensions: "30x50cm", priceAdd: 500, sortOrder: 2 },
            ],
          },
        },
      });
    }
  }

  if (potsCat) {
    const existing = await prisma.product.findUnique({ where: { slug: "surfer-fabric-pot" } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: "Surfer Fabric Pot",
          slug: "surfer-fabric-pot",
          description: "A quilted fabric pot featuring a free motion stitched surfer design. Perfect for storing small items on a desk or dressing table.",
          price: 2899,
          categoryId: potsCat.id,
          hasPersonalisation: true,
          personalisationPrice: 500,
          hasFabricChoice: false,
          hasSizeOptions: false,
          featured: true,
          details: [
            { label: "Size", value: "Approx 12cm diameter x 10cm tall" },
            { label: "Material", value: "Quilted cotton with wadding" },
            { label: "Care", value: "Spot clean" },
          ],
        },
      });
    }
  }

  if (pouchesCat) {
    const existing = await prisma.product.findUnique({ where: { slug: "divers-pouch" } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: "Divers Pouch",
          slug: "divers-pouch",
          description: "A quilted zip pouch featuring a free motion stitched diver design. Ideal as a wash bag, pencil case, or travel pouch.",
          price: 2300,
          categoryId: pouchesCat.id,
          hasPersonalisation: true,
          personalisationPrice: 500,
          hasFabricChoice: false,
          hasSizeOptions: false,
          featured: true,
          details: [
            { label: "Size", value: "Approx 22cm x 14cm" },
            { label: "Closure", value: "YKK zip" },
            { label: "Care", value: "Spot clean" },
          ],
        },
      });
    }
  }

  console.log("Sample products created");

  // Create site image slots
  const siteImages = [
    { key: "hero", label: "Homepage Hero" },
    { key: "maker", label: "Homepage - Emily Photo" },
    { key: "bespoke_1", label: "Homepage - Bespoke Left" },
    { key: "bespoke_2", label: "Homepage - Bespoke Right" },
    { key: "about_hero", label: "About Page Hero" },
    { key: "logo_dark", label: "Logo (Dark - for light backgrounds)" },
    { key: "logo_light", label: "Logo (Light - for dark backgrounds)" },
  ];

  for (const si of siteImages) {
    await prisma.siteImage.upsert({
      where: { key: si.key },
      update: {},
      create: si,
    });
  }
  console.log("Site image slots created");

  console.log("\nDone! Change Emily's password after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
