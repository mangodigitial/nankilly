"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const valid = form.name && form.email && form.message;

  const handleSubmit = async () => {
    if (!valid || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSent(true);
    } catch {
      alert("Failed to send. Please try emailing emily@nankilly.com directly.");
    }
    setSending(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid rgba(0,0,0,0.08)",
    background: "var(--white)",
    fontSize: 14,
    color: "var(--ink)",
    transition: "border-color 0.3s",
  };

  return (
    <>
      <Nav />
      <section style={{ paddingTop: 60 }}>
        <div style={{ padding: "clamp(48px,6vw,80px) clamp(16px,3vw,40px) clamp(28px,3vw,40px)", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cornflower)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 24, height: 1, background: "var(--cornflower)", display: "inline-block" }} />
            Get in Touch
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px,4vw,46px)", fontWeight: 400, lineHeight: 1.15, marginBottom: 14 }}>
            Say hello
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--ink-mid)", fontWeight: 300, maxWidth: 500 }}>
            Whether you have a question about an order, want to discuss a bespoke piece, or just want to say hello. I would love to hear from you.
          </p>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 clamp(16px,3vw,40px)" }}>
          <svg width="100%" height="8"><line x1="0" y1="4" x2="100%" y2="4" stroke="var(--sky-pale)" strokeWidth="1.5" strokeDasharray="6 8" className="stitch-animate" /></svg>
        </div>

        <div style={{ padding: "clamp(32px,4vw,56px) clamp(16px,3vw,40px) clamp(60px,6vw,100px)", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "clamp(32px,4vw,56px)" }}>
            {/* Form */}
            <div>
              {!sent ? (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 10, fontWeight: 500 }}>What is this about?</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { v: "general", l: "General enquiry" },
                        { v: "bespoke", l: "Bespoke order" },
                        { v: "order", l: "Existing order" },
                        { v: "wholesale", l: "Wholesale" },
                      ].map((t) => (
                        <button key={t.v} onClick={() => set("subject", t.v)} style={{
                          padding: "10px 18px",
                          border: "1.5px solid " + (form.subject === t.v ? "var(--ocean)" : "rgba(0,0,0,0.08)"),
                          background: form.subject === t.v ? "rgba(58,111,143,0.04)" : "transparent",
                          color: form.subject === t.v ? "var(--ocean)" : "var(--ink-soft)",
                          cursor: "pointer", fontSize: 12, fontWeight: form.subject === t.v ? 500 : 400,
                          letterSpacing: "0.04em", transition: "all 0.3s",
                        }}>{t.l}</button>
                      ))}
                    </div>
                  </div>

                  {[
                    { k: "name", l: "Name", ph: "Your name" },
                    { k: "email", l: "Email", ph: "you@email.com" },
                  ].map((f) => (
                    <div key={f.k} style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500 }}>
                        {f.l} <span style={{ color: "var(--blush)" }}>*</span>
                      </label>
                      <input value={(form as Record<string, string>)[f.k]} onChange={(e) => set(f.k, e.target.value)} placeholder={f.ph} style={inputStyle} />
                    </div>
                  ))}

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500 }}>
                      Message <span style={{ color: "var(--blush)" }}>*</span>
                    </label>
                    <textarea value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell me about what you are looking for..." rows={6} style={{ ...inputStyle, resize: "vertical" as const, lineHeight: 1.7 }} />
                  </div>

                  <button onClick={handleSubmit} disabled={!valid || sending} style={{
                    padding: "16px 40px", background: valid && !sending ? "var(--ink)" : "rgba(0,0,0,0.2)",
                    color: "white", border: "none", cursor: valid && !sending ? "pointer" : "not-allowed",
                    fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              ) : (
                <div style={{ padding: "clamp(40px,5vw,72px) 0", textAlign: "center" }}>
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ marginBottom: 20 }}>
                    <circle cx="28" cy="28" r="26" stroke="var(--ocean)" strokeWidth="1.5" fill="none" />
                    <path d="M18 28l6 6L38 22" stroke="var(--ocean)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, marginBottom: 12 }}>Message sent</h2>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--ink-mid)", fontWeight: 300, maxWidth: 360, margin: "0 auto" }}>
                    Thank you, {form.name}. Emily will get back to you as soon as possible.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div style={{ background: "var(--navy)", color: "white", padding: "clamp(24px,3vw,36px)", marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--petal)", fontWeight: 500, marginBottom: 16 }}>Direct</div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Email</div>
                  <a href="mailto:emily@nankilly.com" style={{ fontSize: 14, color: "white" }}>emily@nankilly.com</a>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Location</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 300, lineHeight: 1.6 }}>Nankilly Farm<br />Cornwall, UK</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Follow</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Instagram", "Facebook"].map((s) => (
                      <a key={s} href="#" style={{ padding: "8px 16px", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{s}</a>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--sand)", padding: "clamp(20px,2.5vw,28px)", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                    <circle cx="10" cy="10" r="8.5" stroke="var(--cornflower)" strokeWidth="1.2" fill="none" />
                    <line x1="10" y1="5" x2="10" y2="10.5" stroke="var(--cornflower)" strokeWidth="1.3" strokeLinecap="round" />
                    <line x1="10" y1="10.5" x2="13.5" y2="12.5" stroke="var(--cornflower)" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Usually within 24 hours</div>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--ink-soft)", fontWeight: 300 }}>Emily replies to all messages personally.</p>
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--white)", border: "1px solid rgba(0,0,0,0.04)", padding: "clamp(20px,2.5vw,28px)" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 500, marginBottom: 14 }}>Quick links</div>
                {[
                  { l: "Delivery information", href: "/delivery" },
                  { l: "Browse the shop", href: "/shop" },
                  { l: "Visit Nankilly Farm", href: "https://www.nankillyfarm.com" },
                ].map((lnk, i) => (
                  <Link key={i} href={lnk.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.04)" : "none", color: "var(--ink-mid)", fontSize: 13, fontWeight: 300 }}>
                    {lnk.l}
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M0 4h10M7 1l3 3-3 3" stroke="currentColor" strokeWidth="1" /></svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
