import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = { title: "Delivery & Returns - Nankilly" };

export default function DeliveryPage() {
  return (
    <>
      <Nav />
      <section style={{ paddingTop: 60 }}>
        <div style={{ padding: "clamp(48px,6vw,80px) clamp(16px,3vw,40px) clamp(36px,4vw,56px)", maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cornflower)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ width: 24, height: 1, background: "var(--cornflower)", display: "inline-block" }} />
            Info
            <span style={{ width: 24, height: 1, background: "var(--cornflower)", display: "inline-block" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px,4vw,46px)", fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>
            {"Delivery & Returns"}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--ink-mid)", fontWeight: 300, maxWidth: 540, margin: "0 auto" }}>
            Every piece is made with care and wrapped with love. Here is everything you need to know about getting your order to you.
          </p>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 clamp(16px,3vw,40px)" }}>
          <svg width="100%" height="8"><line x1="0" y1="4" x2="100%" y2="4" stroke="var(--sky-pale)" strokeWidth="1.5" strokeDasharray="6 8" className="stitch-animate" /></svg>
        </div>

        {/* Delivery times */}
        <div style={{ padding: "clamp(36px,4vw,56px) clamp(16px,3vw,40px)", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <div style={{ background: "var(--sand)", padding: "clamp(28px,3vw,40px)" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cornflower)", fontWeight: 500, marginBottom: 14 }}>Made to Order</div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, marginBottom: 12 }}>7-10 working days</h3>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--ink-mid)", fontWeight: 300 }}>
                Most items are handmade to order. Your piece will be crafted and despatched within 7-10 working days, via first class post.
              </p>
            </div>
            <div style={{ background: "var(--navy)", color: "white", padding: "clamp(28px,3vw,40px)" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--petal)", fontWeight: 500, marginBottom: 14 }}>In Stock Items</div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, marginBottom: 12 }}>Next working day</h3>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>
                Items marked as in stock are despatched the next working day by first class post.
              </p>
            </div>
          </div>
        </div>

        {/* Shipping pricing */}
        <div style={{ padding: "0 clamp(16px,3vw,40px) clamp(36px,4vw,56px)", maxWidth: 800, margin: "0 auto" }}>
          {[
            {
              icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="2" y="6" width="24" height="16" rx="2" stroke="var(--cornflower)" strokeWidth="1.5" fill="none" /><path d="M2 10h24" stroke="var(--cornflower)" strokeWidth="1.5" /><rect x="6" y="14" width="8" height="4" rx="1" stroke="var(--cornflower)" strokeWidth="1" fill="none" /></svg>,
              title: "UK Delivery",
              lines: [
                { l: "All orders", r: "\u00A35.99", hl: true },
                { l: "Sent via", r: "Royal Mail 1st Class", hl: false },
              ],
            },
            {
              icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke="var(--cornflower)" strokeWidth="1.5" fill="none" /><ellipse cx="14" cy="14" rx="5" ry="11" stroke="var(--cornflower)" strokeWidth="1" fill="none" /><line x1="3" y1="10" x2="25" y2="10" stroke="var(--cornflower)" strokeWidth="1" /><line x1="3" y1="18" x2="25" y2="18" stroke="var(--cornflower)" strokeWidth="1" /></svg>,
              title: "International",
              lines: [{ l: "Available on request", r: "", hl: false }],
              note: "Please contact emily@nankilly.com for an international shipping quote before ordering.",
            },
          ].map((sec, si) => (
            <div key={si} style={{ padding: "clamp(24px,3vw,36px) 0", borderBottom: si === 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                {sec.icon}
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 400 }}>{sec.title}</h3>
              </div>
              {sec.lines.map((line, li) => (
                <div key={li} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: li < sec.lines.length - 1 ? "1px solid rgba(0,0,0,0.03)" : "none" }}>
                  <span style={{ fontSize: 14, color: "var(--ink-mid)", fontWeight: 300 }}>{line.l}</span>
                  <span style={{ fontSize: 14, fontWeight: line.hl ? 500 : 400, color: line.hl ? "var(--ocean)" : "var(--ink)" }}>{line.r}</span>
                </div>
              ))}
              {sec.note && <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink-soft)", fontWeight: 300, marginTop: 12 }}>{sec.note}</p>}
            </div>
          ))}
        </div>

        {/* Time sensitive */}
        <div style={{ padding: "0 clamp(16px,3vw,40px) clamp(36px,4vw,56px)", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ padding: "clamp(24px,3vw,36px)", background: "rgba(107,159,204,0.06)", border: "1px solid rgba(107,159,204,0.1)", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="11" cy="11" r="9.5" stroke="var(--cornflower)" strokeWidth="1.2" fill="none" />
              <line x1="11" y1="6" x2="11" y2="12" stroke="var(--cornflower)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="11" y1="12" x2="15" y2="14" stroke="var(--cornflower)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Time sensitive order?</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink-mid)", fontWeight: 300 }}>
                {"If your order is for a specific date, please contact "}
                <a href="mailto:emily@nankilly.com" style={{ color: "var(--ocean)", fontWeight: 400 }}>emily@nankilly.com</a>
                {" to confirm the delivery ETA before ordering."}
              </p>
            </div>
          </div>
        </div>

        {/* Returns */}
        <section style={{ background: "var(--sand)", padding: "clamp(48px,6vw,72px) clamp(16px,3vw,40px)", marginTop: "clamp(36px,4vw,56px)" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cornflower)", display: "block", marginBottom: 12 }}>Returns</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px,3vw,34px)", fontWeight: 400 }}>
                {"Made with "}<em style={{ fontStyle: "italic", color: "var(--ocean)" }}>care</em>
              </h2>
            </div>
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
              {[
                { q: "What if something is not right?", a: "If you are unhappy with your purchase for any reason, please get in touch within 14 days of receiving your order and we will do our best to resolve things." },
                { q: "Can I return a personalised item?", a: "As personalised items are made specifically for you, we are unable to offer refunds on these unless the item is faulty." },
                { q: "What about faulty items?", a: "If your item arrives damaged or faulty, please contact us with a photo and we will arrange a replacement or full refund." },
              ].map((item, i) => (
                <div key={i} style={{ padding: "20px 0", borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{item.q}</h4>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--ink-mid)", fontWeight: 300 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "clamp(48px,6vw,72px) clamp(16px,3vw,40px)", textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "var(--ink-mid)", fontWeight: 300, marginBottom: 20 }}>Have a question about your order?</p>
          <a href="mailto:emily@nankilly.com" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 36px", background: "var(--ink)", color: "white", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Contact Emily
          </a>
        </section>
      </section>
      <Footer />
    </>
  );
}
