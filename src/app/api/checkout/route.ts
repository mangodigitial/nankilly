import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSquareCheckout } from "@/lib/square";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer } = body;

    if (!items?.length || !customer?.name || !customer?.email || !customer?.postcode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate totals (all in pence)
    const subtotal = items.reduce(
      (s: number, i: { unitPrice: number; quantity: number }) => s + i.unitPrice * i.quantity,
      0
    );
    const deliveryFee = 599; // flat £5.99
    const total = subtotal + deliveryFee;

    // Generate order number: NK-YYMMDD-XXXX
    const now = new Date();
    const datePart =
      String(now.getFullYear()).slice(2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    const randPart = uuid().slice(0, 4).toUpperCase();
    const orderNumber = "NK-" + datePart + "-" + randPart;

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "pending",
        customerName: customer.name,
        customerEmail: customer.email,
        addressLine1: customer.address || "",
        addressLine2: customer.address2 || null,
        city: customer.city || "",
        postcode: customer.postcode,
        subtotal,
        deliveryFee,
        total,
        customerNote: customer.note || null,
        items: {
          create: items.map(
            (item: {
              productId: string;
              productName: string;
              unitPrice: number;
              quantity: number;
              sizeName?: string;
              fabricName?: string;
              personalisation?: string;
              dropdownChoice?: string;
            }) => ({
              productId: item.productId,
              productName: item.productName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              sizeName: item.sizeName || null,
              fabricName: item.fabricName || null,
              personalisation: item.personalisation || null,
              dropdownChoice: item.dropdownChoice || null,
            })
          ),
        },
      },
    });

    // Create Square checkout link
    const { checkoutUrl, squareOrderId } = await createSquareCheckout({
      orderId: order.id,
      orderNumber,
      items,
      deliveryFee,
      customerEmail: customer.email,
    });

    // Update order with Square refs
    await prisma.order.update({
      where: { id: order.id },
      data: {
        squareCheckoutUrl: checkoutUrl,
        squareOrderId: squareOrderId,
      },
    });

    return NextResponse.json({ checkoutUrl, orderId: order.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
