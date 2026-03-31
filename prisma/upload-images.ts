import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.productImage.findMany({
    include: { product: { select: { name: true, slug: true } } },
  });

  console.log(`Found ${images.length} product images to process.\n`);

  let uploaded = 0;
  let skipped = 0;

  for (const img of images) {
    // Skip if already on Vercel Blob
    if (img.url.includes("blob.vercel-storage.com")) {
      console.log(`Skipped (already on blob): ${img.product.name}`);
      skipped++;
      continue;
    }

    try {
      // Download from WordPress
      console.log(`Downloading: ${img.product.name}...`);
      const response = await fetch(img.url);
      if (!response.ok) {
        console.error(`  Failed to download (${response.status}): ${img.url}`);
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") || "image/jpeg";

      // Extract filename from URL
      const urlParts = img.url.split("/");
      const filename = urlParts[urlParts.length - 1];
      const blobPath = `products/${img.product.slug}/${filename}`;

      // Upload to Vercel Blob
      console.log(`  Uploading to blob: ${blobPath}`);
      const blob = await put(blobPath, buffer, {
        access: "public",
        contentType,
      });

      // Update database record
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: blob.url },
      });

      console.log(`  Done: ${blob.url}`);
      uploaded++;
    } catch (err) {
      console.error(`  Error processing ${img.product.name}:`, err);
    }
  }

  console.log(`\nComplete. ${uploaded} uploaded, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
