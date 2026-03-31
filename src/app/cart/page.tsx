"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const clearCart = useCart((s) => s.clearCart);
  const subtotal = useCart((s) => s.subtotal());
  const deliveryFee = useCart((s) => s.deliveryFee());
  const total = useCart((s) => s.total());
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "", address2: "", city: "", postcode: "", note: "" });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const valid = form.name && form.email && form.address && form.city && form.postcode && items.length > 0;

  const handleCheckout = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            sizeName: i.sizeName,
            fabricName: i.fabricName,
            personalisation: i.personalisation,
          })),
          customer: form,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        clearCart();
        window.location.href = data.checkoutUrl;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Failed to create checkout. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px",
    border: "1px solid rgba(0,0,0,0.08)", background: "var(--white)",
    fontSize: 14, color: "var(--ink)", transition: "border-color 0.3s",
  };

  return (
    <>
      <Nav />
      <section style={{ paddingTop: 60, minHeight: "80vh" }}>
        <div style={{ padding: "clamp(48px,6vw,80px) clamp(16px,3vw,40px)", maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 400, marginBottom: 32 }}>
            {items.length === 0 ? "Your bag is empty" : "Checkout"}
          </h1>

          {items.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48 }}>
              {/* Left: form */}
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 20 }}>Delivery details</h2>
                {[
                  { k: "name", l: "Full Name", ph: "Emily Smith", req: true },
                  { k: "email", l: "Email", ph: "you@email.com", req: true },
                  { k: "address", l: "Address", ph: "Nankilly Farm", req: true },
                  { k: "address2", l: "Address line 2", ph: "Optional", req: false },
                  { k: "city", l: "City", ph: "Truro", req: true },
                  { k: "postcode", l: "Postcode", ph: "TR1 1AA", req: true },
                ].map((f) => (
                  <div key={f.k} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, display: "block", marginBottom: 6, fontWeight: 500 }}>
                      {f.l} {f.req && <span style={{ color: "var(--blush)" }}>*</span>}
                    </label>
                    <input value={(form as Record<string, string>)[f.k]} onChange={(e) => set(f.k, e.target.value)} placeholder={f.ph} style={inputStyle} />
                  </div>
                ))}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, display: "block", marginBottom: 6, fontWeight: 500 }}>Order note</label>
                  <textarea value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Anything we should know?" rows={3} style={{ ...inputStyle, resize: "vertical" as const, lineHeight: 1.6 }} />
                </div>
              </div>

              {/* Right: summary */}
              <div>
                <div style={{ background: "var(--sand)", padding: 28, marginBottom: 16, position: "sticky", top: 80 }}>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, marginBottom: 20 }}>Order Summary</h3>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", fontSize: 13 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 400, marginBottom: 2 }}>{item.productName}</div>
                        <div style={{ fontSize: 10, color: "var(--ink-soft)", fontWeight: 300 }}>
                          {[item.sizeName, item.fabricName].filter(Boolean).join(" / ")}
                          {item.personalisation && ' / "' + item.personalisation + '"'}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 20, height: 20, border: "1px solid rgba(0,0,0,0.08)", background: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                          <span style={{ fontSize: 12, fontWeight: 500, width: 20, textAlign: "center" as const }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 20, height: 20, border: "1px solid rgba(0,0,0,0.08)", background: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        </div>
                      </div>
                      <span style={{ fontWeight: 500, color: "var(--ocean)", flexShrink: 0, marginLeft: 12 }}>
                        {"£" + ((item.unitPrice * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                      <span style={{ color: "var(--ink-soft)", fontWeight: 300 }}>Subtotal</span>
                      <span>{"£" + (subtotal / 100).toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                      <span style={{ color: "var(--ink-soft)", fontWeight: 300 }}>Delivery</span>
                      <span>{"£" + (deliveryFee / 100).toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 500 }}>Total</span>
                      <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ocean)" }}>{"£" + (total / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <button onClick={handleCheckout} disabled={!valid || loading} style={{
                    width: "100%", padding: 16, marginTop: 20,
                    background: valid && !loading ? "var(--ink)" : "rgba(0,0,0,0.2)",
                    color: "white", border: "none",
                    cursor: valid && !loading ? "pointer" : "not-allowed",
                    fontSize: 12, fontWeight: 500, letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                  }}>
                    {loading ? "Creating checkout..." : "Pay with Square"}
                  </button>
                  <p style={{ fontSize: 10, color: "var(--ink-soft)", fontWeight: 300, marginTop: 10, lineHeight: 1.5, textAlign: "center" as const }}>
                    You will be redirected to Square for secure payment
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
