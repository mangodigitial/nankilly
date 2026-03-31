import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const logos = await prisma.siteImage.findMany({
    where: { key: { in: ["logo_dark", "logo_light"] } },
  });
  const result: Record<string, string | null> = { logo_dark: null, logo_light: null };
  for (const l of logos) result[l.key] = l.url;
  return NextResponse.json(result);
}
