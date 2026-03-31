import { Resend } from "resend";

let _resend: Resend;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const notifyEmail = process.env.NOTIFY_EMAIL || "emily@nankilly.com";

// ── Order confirmation to customer ──
export async function sendOrderConfirmation(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { productName: string; quantity: number; unitPrice: number; sizeName?: string | null; fabricName?: string | null; personalisation?: string | null }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  const itemsHtml = order.items
    .map((i) => {
      const opts: string[] = [];
      if (i.sizeName) opts.push(i.sizeName);
      if (i.fabricName) opts.push("Fabric: " + i.fabricName);
      if (i.personalisation) opts.push("Personalised: " + i.personalisation);
      const optsStr = opts.length > 0 ? "<br/><small style='color:#7A7670'>" + opts.join(" / ") + "</small>" : "";
      return "<tr><td style='padding:12px 0;border-bottom:1px solid #F0E6D8'>" + i.productName + optsStr + "</td><td style='padding:12px 0;border-bottom:1px solid #F0E6D8;text-align:right'>" + i.quantity + " x &pound;" + (i.unitPrice / 100).toFixed(2) + "</td></tr>";
    })
    .join("");

  await getResend().emails.send({
    from: "Nankilly <" + from + ">",
    to: order.customerEmail,
    subject: "Order confirmed - " + order.orderNumber,
    html: `
      <div style="font-family:'Outfit',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1E1E1C">
        <div style="padding:32px 0;text-align:center;border-bottom:1px solid #F0E6D8">
          <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0">Nankilly</h1>
        </div>
        <div style="padding:32px 0">
          <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;margin:0 0 8px">Thank you, ${order.customerName}</h2>
          <p style="color:#7A7670;font-size:14px;line-height:1.7;margin:0">Your order <strong>${order.orderNumber}</strong> has been confirmed. Emily will begin crafting your pieces shortly.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${itemsHtml}
          <tr><td style="padding:8px 0;color:#7A7670">Subtotal</td><td style="padding:8px 0;text-align:right">&pound;${(order.subtotal / 100).toFixed(2)}</td></tr>
          <tr><td style="padding:8px 0;color:#7A7670">Delivery</td><td style="padding:8px 0;text-align:right">&pound;${(order.deliveryFee / 100).toFixed(2)}</td></tr>
          <tr><td style="padding:12px 0;font-weight:600;border-top:1px solid #1E1E1C">Total</td><td style="padding:12px 0;text-align:right;font-weight:600;border-top:1px solid #1E1E1C;color:#3A6F8F">&pound;${(order.total / 100).toFixed(2)}</td></tr>
        </table>
        <div style="padding:24px 0;margin-top:16px;background:#FAF6F0;padding:20px;font-size:13px;color:#7A7670;line-height:1.6">
          <strong style="color:#1E1E1C">What happens next?</strong><br/>
          Each piece is handmade to order at Nankilly Farm. Please allow 7-10 working days for your items to be crafted and despatched via Royal Mail first class.
        </div>
        <div style="padding:24px 0;text-align:center;font-size:12px;color:#B5AFA8">
          Nankilly &middot; Nankilly Farm, Cornwall<br/>
          <a href="mailto:emily@nankilly.com" style="color:#6B9FCC">emily@nankilly.com</a>
        </div>
      </div>
    `,
  });
}

// ── Notify Emily of new order ──
export async function sendOrderNotification(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { productName: string; quantity: number; personalisation?: string | null }[];
}) {
  const itemsList = order.items
    .map((i) => "- " + i.productName + " x" + i.quantity + (i.personalisation ? ' (Personalised: "' + i.personalisation + '")' : ""))
    .join("\n");

  await getResend().emails.send({
    from: "Nankilly Orders <" + from + ">",
    to: notifyEmail,
    subject: "New order " + order.orderNumber + " - " + order.customerName,
    text: "New order received!\n\nOrder: " + order.orderNumber + "\nCustomer: " + order.customerName + " (" + order.customerEmail + ")\nTotal: GBP " + (order.total / 100).toFixed(2) + "\n\nItems:\n" + itemsList + "\n\nView in admin: " + process.env.NEXT_PUBLIC_URL + "/admin",
  });
}

// ── Contact form submission ──
export async function sendContactNotification(msg: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await getResend().emails.send({
    from: "Nankilly Contact <" + from + ">",
    to: notifyEmail,
    replyTo: msg.email,
    subject: "Contact form: " + msg.subject + " from " + msg.name,
    text: "Name: " + msg.name + "\nEmail: " + msg.email + "\nSubject: " + msg.subject + "\n\nMessage:\n" + msg.message,
  });

  // Auto-reply to customer
  await getResend().emails.send({
    from: "Nankilly <" + from + ">",
    to: msg.email,
    subject: "Thanks for getting in touch",
    html: `
      <div style="font-family:'Outfit',Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1E1E1C">
        <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:400">Thank you, ${msg.name}</h1>
        <p style="font-size:14px;line-height:1.7;color:#7A7670">Your message has been received. Emily will get back to you as soon as possible, usually within 24 hours.</p>
        <p style="font-size:12px;color:#B5AFA8;margin-top:24px">Nankilly &middot; Nankilly Farm, Cornwall</p>
      </div>
    `,
  });
}

// ── Shipping notification ──
export async function sendShippingNotification(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
}) {
  await getResend().emails.send({
    from: "Nankilly <" + from + ">",
    to: order.customerEmail,
    subject: "Your order is on its way! - " + order.orderNumber,
    html: `
      <div style="font-family:'Outfit',Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1E1E1C">
        <div style="padding:32px 0;text-align:center;border-bottom:1px solid #F0E6D8">
          <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0">Nankilly</h1>
        </div>
        <div style="padding:32px 0">
          <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;margin:0 0 12px">On its way to you</h2>
          <p style="color:#7A7670;font-size:14px;line-height:1.7">Your order <strong>${order.orderNumber}</strong> has been lovingly wrapped and posted via Royal Mail first class. It should be with you within 1-2 working days.</p>
          <p style="color:#7A7670;font-size:14px;line-height:1.7;margin-top:16px">We hope you love your new Nankilly pieces. If you have any questions at all, just reply to this email.</p>
        </div>
        <div style="padding:24px 0;text-align:center;font-size:12px;color:#B5AFA8">
          Nankilly &middot; Nankilly Farm, Cornwall
        </div>
      </div>
    `,
  });
}
