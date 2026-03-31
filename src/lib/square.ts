import { Client, Environment } from "square";

let _client: Client;
function getClient() {
  if (!_client) {
    _client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment:
        process.env.SQUARE_ENVIRONMENT === "production"
          ? Environment.Production
          : Environment.Sandbox,
    });
  }
  return _client;
}

interface CartItem {
  productName: string;
  quantity: number;
  unitPrice: number; // pence
  sizeName?: string;
  fabricName?: string;
  personalisation?: string;
}

interface CreateCheckoutParams {
  orderId: string;
  orderNumber: string;
  items: CartItem[];
  deliveryFee: number; // pence
  customerEmail: string;
}

export async function createSquareCheckout({
  orderId,
  orderNumber,
  items,
  deliveryFee,
  customerEmail,
}: CreateCheckoutParams) {
  const lineItems = items.map((item) => {
    const mods: string[] = [];
    if (item.sizeName) mods.push(item.sizeName);
    if (item.fabricName) mods.push(item.fabricName);
    if (item.personalisation) mods.push("Personalised: " + item.personalisation);
    const note = mods.length > 0 ? " (" + mods.join(", ") + ")" : "";

    return {
      name: item.productName + note,
      quantity: String(item.quantity),
      basePriceMoney: {
        amount: BigInt(item.unitPrice),
        currency: "GBP",
      },
    };
  });

  // Add delivery as a line item if not free
  if (deliveryFee > 0) {
    lineItems.push({
      name: "UK Delivery",
      quantity: "1",
      basePriceMoney: {
        amount: BigInt(deliveryFee),
        currency: "GBP",
      },
    });
  }

  const response = await getClient().checkoutApi.createPaymentLink({
    idempotencyKey: orderId,
    order: {
      locationId: process.env.SQUARE_LOCATION_ID!,
      referenceId: orderNumber,
      lineItems,
    },
    checkoutOptions: {
      redirectUrl: process.env.NEXT_PUBLIC_URL + "/checkout/success?order=" + orderId,
      merchantSupportEmail: process.env.NOTIFY_EMAIL,
    },
    prePopulatedData: {
      buyerEmail: customerEmail,
    },
  });

  return {
    checkoutUrl: response.result.paymentLink?.url,
    squareOrderId: response.result.paymentLink?.orderId,
  };
}
