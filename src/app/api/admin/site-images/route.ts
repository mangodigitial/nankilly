import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const images = await prisma.siteImage.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(images);
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key, url, alt } = await req.json();
  if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

  const image = await prisma.siteImage.update({
    where: { key },
    data: { url, alt },
  });

  return NextResponse.json(image);
}
