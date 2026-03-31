import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/db";
import { sendOrderConfirmation, sendOrderNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Verify Square webhook signature
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (signatureKey) {
      const signature = req.headers.get("x-square-hmac-sha256");
      const notificationUrl = `${process.env.NEXT_PUBLIC_URL}/api/webhook`;
      const hash = createHmac("sha256", signatureKey)
        .update(notificationUrl + rawBody)
        .digest("base64");
      if (signature !== hash) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const body = JSON.parse(rawBody);

    // Handle payment completed event
    if (body.type === "payment.completed" || body.type === "payment.updated") {
      const payment = body.data?.object?.payment;
      if (!payment) return NextResponse.json({ ok: true });

      const squareOrderId = payment.order_id;
      if (!squareOrderId) return NextResponse.json({ ok: true });

      // Find order by Square order ID
      const order = await prisma.order.findFirst({
        where: { squareOrderId },
        include: { items: true },
      });

      if (!order) {
        console.error("Order not found for Square order:", squareOrderId);
        return NextResponse.json({ ok: true });
      }

      // Only process if not already paid
      if (order.status !== "pending") {
        return NextResponse.json({ ok: true });
      }

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          squarePaymentId: payment.id,
          paidAt: new Date(),
        },
      });

      // Send confirmation email to customer
      await sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          sizeName: i.sizeName,
          fabricName: i.fabricName,
          personalisation: i.personalisation,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
      });

      // Notify Emily
      await sendOrderNotification({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        items: order.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          personalisation: i.personalisation,
        })),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
