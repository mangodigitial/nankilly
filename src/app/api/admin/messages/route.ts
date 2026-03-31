import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(messages);
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, read } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.contactMessage.update({
    where: { id },
    data: { read: read !== false },
  });

  return NextResponse.json({ ok: true });
}
