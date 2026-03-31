import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendContactNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save to DB
    await prisma.contactMessage.create({
      data: { name, email, subject: subject || "general", message },
    });

    // Send emails
    await sendContactNotification({ name, email, subject: subject || "general", message });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
