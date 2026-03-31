import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function CheckoutSuccess() {
  return (
    <>
      <Nav />
      <section style={{ paddingTop: 60, minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 480, padding: "clamp(48px,6vw,80px) clamp(16px,3vw,40px)" }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 24 }}>
            <circle cx="32" cy="32" r="30" stroke="var(--ocean)" strokeWidth="1.5" fill="none" />
            <path d="M20 32l8 8L44 24" stroke="var(--ocean)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px,4vw,40px)", fontWeight: 400, marginBottom: 16 }}>
            Thank you
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--ink-mid)", fontWeight: 300, marginBottom: 12 }}>
            Your order has been received and Emily will begin crafting your pieces shortly.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--ink-soft)", fontWeight: 300, marginBottom: 32 }}>
            A confirmation email is on its way to you. Most items are handmade to order, so please allow 7-10 working days for your pieces to be crafted and despatched.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/shop" style={{ padding: "14px 32px", background: "var(--ink)", color: "white", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Continue Shopping
            </Link>
            <Link href="/" style={{ padding: "14px 32px", border: "1px solid rgba(0,0,0,0.1)", fontSize: 12, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
              Home
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
