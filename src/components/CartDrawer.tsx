"use client";

import { useCart } from "@/lib/cart";
import Link from "next/link";

const catColors: Record<string, string> = {
  Cushions: "#E0A4A0",
  "Fabric Pots": "#6B9FCC",
  Pouches: "#A8CDE0",
  Bags: "#D4789A",
  Bunting: "#F2D1CE",
  Washbags: "#F0E6D8",
  Toys: "#D6E8F0",
  Scents: "#F5EFE6",
};

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const subtotal = useCart((s) => s.subtotal());
  const deliveryFee = useCart((s) => s.deliveryFee());
  const total = useCart((s) => s.total());

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 200, animation: "fadeIn 0.3s ease",
        }}
      />
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes cartSlide{from{transform:translateX(100%)}to{transform:translateX(0)}} @keyframes stitchDash{to{stroke-dashoffset:-24}}`}</style>

      {/* Drawer */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(380px, 88vw)", background: "var(--white)",
          zIndex: 201, display: "flex", flexDirection: "column",
          animation: "cartSlide 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Stitch border */}
        <svg style={{ position: "absolute", left: -2, top: 0, width: 4, height: "100%" }}>
          <line x1="2" y1="0" x2="2" y2="100%" stroke="var(--cornflower)" strokeWidth="2" strokeDasharray="8 6" style={{ animation: "stitchDash 2s linear infinite" }} />
        </svg>

        {/* Header */}
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 19, fontWeight: 500 }}>Your Bag</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--ink-soft)" }}>
            x
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 24px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 300, marginTop: 12 }}>Your bag is empty</p>
              <button onClick={onClose} style={{ marginTop: 20, padding: "12px 28px", background: "var(--blush)", color: "var(--ink)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={item.id} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: idx < items.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                <div style={{
                  width: 56, height: 56, flexShrink: 0,
                  background: "linear-gradient(135deg, var(--sky-pale), var(--linen))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderTop: "3px solid " + (catColors[item.category] || "var(--sand)"),
                  overflow: "hidden",
                }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 10, color: "var(--ink-soft)", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>img</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, fontWeight: 400, lineHeight: 1.3, marginBottom: 2 }}>{item.productName}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-soft)", fontWeight: 300 }}>
                    {[item.sizeName, item.fabricName].filter(Boolean).join(" / ")}
                  </div>
                  {item.personalisation && (
                    <div style={{ fontSize: 10, color: "var(--ocean)", fontStyle: "italic", fontFamily: "var(--font-serif)", marginTop: 2 }}>
                      {'"' + item.personalisation + '"'}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <div style={{ display: "flex" }}>
                      {[
                        { l: "-", d: -1 },
                        { l: String(item.quantity), d: 0 },
                        { l: "+", d: 1 },
                      ].map((b, i) => (
                        <button
                          key={i}
                          onClick={b.d !== 0 ? () => updateQuantity(item.id, item.quantity + b.d) : undefined}
                          style={{
                            width: b.d === 0 ? 24 : 20, height: 20,
                            border: "1px solid rgba(0,0,0,0.07)",
                            background: b.d === 0 ? "rgba(0,0,0,0.02)" : "none",
                            cursor: b.d !== 0 ? "pointer" : "default",
                            fontSize: 10, color: "var(--ink)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: b.d === 0 ? 500 : 300,
                          }}
                        >
                          {b.l}
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ocean)" }}>
                      {"£" + ((item.unitPrice * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "14px 24px 22px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 300 }}>Subtotal</span>
              <span style={{ fontSize: 12 }}>{"£" + (subtotal / 100).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 300 }}>Delivery</span>
              <span style={{ fontSize: 12 }}>
                {"£" + (deliveryFee / 100).toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.05)", marginTop: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ocean)" }}>
                {"£" + (total / 100).toFixed(2)}
              </span>
            </div>
            <Link
              href="/cart"
              onClick={onClose}
              style={{
                display: "block", width: "100%", padding: 14, marginTop: 12,
                background: "var(--ink)", color: "white",
                textAlign: "center", fontSize: 11, fontWeight: 500,
                letterSpacing: "0.08em", textTransform: "uppercase" as const,
              }}
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
