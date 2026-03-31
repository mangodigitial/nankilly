import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { sendShippingNotification } from "@/lib/email";

// GET all orders
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

// PUT update order status
export async function PUT(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status, adminNote } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (status === "shipped") updateData.shippedAt = new Date();

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Send shipping email when status changes to shipped
    if (status === "shipped") {
      await sendShippingNotification({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
