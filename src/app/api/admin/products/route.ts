import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// GET all products
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, sizeOptions: { orderBy: { sortOrder: "asc" } }, dropdownOptions: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

// POST create product
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        subtitle: body.subtitle || null,
        slug: body.slug,
        description: body.description || null,
        price: body.price, // pence
        categoryId: body.categoryId,
        hasPersonalisation: body.hasPersonalisation || false,
        personalisationPrice: body.personalisationPrice || 500,
        personalisationNote: body.personalisationNote || null,
        hasFabricChoice: body.hasFabricChoice || false,
        fabricNote: body.fabricNote || null,
        hasSizeOptions: body.hasSizeOptions || false,
        hasDropdown: body.hasDropdown || false,
        dropdownLabel: body.dropdownLabel || null,
        details: body.details || null,
        badge: body.badge || null,
        active: body.active !== false,
        featured: body.featured || false,
        inStock: body.inStock || false,
        images: body.images?.length
          ? { create: body.images.map((img: { url: string; alt?: string }, i: number) => ({ url: img.url, alt: img.alt || null, sortOrder: i })) }
          : undefined,
        sizeOptions: body.sizeOptions?.length
          ? {
              create: body.sizeOptions.map((s: { label: string; dimensions: string; priceAdd?: number }, i: number) => ({
                label: s.label,
                dimensions: s.dimensions,
                priceAdd: s.priceAdd || 0,
                sortOrder: i,
              })),
            }
          : undefined,
        dropdownOptions: body.dropdownOptions?.length
          ? {
              create: body.dropdownOptions.map((d: { label: string; priceAdd?: number }, i: number) => ({
                label: d.label,
                priceAdd: d.priceAdd || 0,
                sortOrder: i,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// PUT update product
export async function PUT(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, images, sizeOptions, dropdownOptions, ...data } = body;

    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    // Update main product
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    // Replace images if provided
    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: { url: string; alt?: string }, i: number) => ({
            productId: id,
            url: img.url,
            alt: img.alt || null,
            sortOrder: i,
          })),
        });
      }
    }

    // Replace size options if provided
    if (sizeOptions) {
      await prisma.sizeOption.deleteMany({ where: { productId: id } });
      if (sizeOptions.length > 0) {
        await prisma.sizeOption.createMany({
          data: sizeOptions.map((s: { label: string; dimensions: string; priceAdd?: number }, i: number) => ({
            productId: id,
            label: s.label,
            dimensions: s.dimensions,
            priceAdd: s.priceAdd || 0,
            sortOrder: i,
          })),
        });
      }
    }

    // Replace dropdown options if provided
    if (dropdownOptions) {
      await prisma.dropdownOption.deleteMany({ where: { productId: id } });
      if (dropdownOptions.length > 0) {
        await prisma.dropdownOption.createMany({
          data: dropdownOptions.map((d: { label: string; priceAdd?: number }, i: number) => ({
            productId: id,
            label: d.label,
            priceAdd: d.priceAdd || 0,
            sortOrder: i,
          })),
        });
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
