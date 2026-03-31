"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart";

interface ProductProps {
  product: {
    id: string;
    name: string;
    subtitle: string | null;
    slug: string;
    description: string | null;
    price: number;
    category: string;
    hasPersonalisation: boolean;
    personalisationPrice: number;
    personalisationNote: string | null;
    personalisationMaxChars: number;
    hasFabricChoice: boolean;
    fabricNote: string | null;
    hasSizeOptions: boolean;
    hasDropdown: boolean;
    dropdownLabel: string | null;
    dropdownOptions: { label: string; priceAdd: number }[];
    details: { label: string; value: string }[] | null;
    badge: string | null;
    inStock: boolean;
    images: { url: string; alt: string | null }[];
    sizeOptions: { label: string; dimensions: string; priceAdd: number }[];
  };
  fabrics: { id: string; name: string; hex: string; pattern: string; story: string | null; imageUrl: string | null }[];
}

const catColors: Record<string, string> = {
  Cushions: "#E0A4A0", "Fabric Pots": "#6B9FCC", Pouches: "#A8CDE0",
  Bags: "#D4789A", Bunting: "#F2D1CE", Washbags: "#F0E6D8",
};

export default function ProductDetail({ product, fabrics }: ProductProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [fabric, setFabric] = useState(fabrics[0] || null);
  const [size, setSize] = useState(product.sizeOptions[0] || null);
  const [persOn, setPersOn] = useState(false);
  const [persText, setPersText] = useState("");
  const [dropdown, setDropdown] = useState(product.dropdownOptions[0] || null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState("story");
  const [zoomed, setZoomed] = useState(false);
  const [fabricOpen, setFabricOpen] = useState(false);
  const fabricRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const addItem = useCart((s) => s.addItem);

  const imgCount = product.images.length;
  const prevImg = useCallback(() => setActiveImg((i) => (i - 1 + imgCount) % imgCount), [imgCount]);
  const nextImg = useCallback(() => setActiveImg((i) => (i + 1) % imgCount), [imgCount]);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 40) { diff > 0 ? prevImg() : nextImg(); }
    touchStart.current = null;
  };

  const unitPrice = product.price + (size?.priceAdd || 0) + (dropdown?.priceAdd || 0) + (persOn && persText ? product.personalisationPrice : 0);
  const total = unitPrice * qty;
  const accentColor = catColors[product.category] || "#F0E6D8";
  const isBunting = product.category === "Bunting";

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name + (product.subtitle ? " - " + product.subtitle : ""),
      productSlug: product.slug,
      imageUrl: product.images[0]?.url,
      category: product.category,
      unitPrice,
      quantity: qty,
      sizeName: size?.label,
      fabricName: fabric?.name,
      personalisation: persOn && persText ? persText : undefined,
      dropdownChoice: dropdown?.label,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div style={{ padding: "20px clamp(16px,3vw,40px) clamp(40px,5vw,80px)", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "55% 1fr", gap: "clamp(24px,3vw,56px)" }}>
        {/* GALLERY */}
        <div style={{ position: "sticky", top: 72, alignSelf: "flex-start" }}>
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              aspectRatio: "4/5", position: "relative", overflow: "hidden",
              background: "linear-gradient(145deg, var(--sky-pale), var(--linen), var(--sand))",
              marginBottom: 12, cursor: product.images[activeImg] ? "zoom-in" : "default",
            }}
            onClick={() => product.images[activeImg] && setZoomed(true)}
          >
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: 60, background: accentColor, zIndex: 2 }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: 60, height: 4, background: accentColor, zIndex: 2 }} />

            {product.images[activeImg] ? (
              <Image src={product.images[activeImg].url} alt={product.images[activeImg].alt || product.name} fill style={{ objectFit: "cover" }} sizes="55vw" priority />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--ink-soft)" }}>
                No image yet
              </div>
            )}

            {product.badge && (
              <span style={{ position: "absolute", top: 16, left: 16, zIndex: 3, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 12px", background: "white", color: "var(--ocean)", fontWeight: 500 }}>
                {product.badge}
              </span>
            )}

            {/* Gallery arrows */}
            {imgCount > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImg(); }} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 4, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImg(); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 4, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {/* Dot indicators */}
                <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", zIndex: 4, display: "flex", gap: 6 }}>
                  {product.images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImg(i); }} style={{ width: activeImg === i ? 18 : 6, height: 6, borderRadius: 3, background: activeImg === i ? "white" : "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />
                  ))}
                </div>
              </>
            )}

            {/* Fabric swatch preview */}
            {fabric && (
              <div style={{ position: "absolute", bottom: imgCount > 1 ? 32 : 20, right: 20, zIndex: 3, width: 48, height: 48, background: fabric.hex, border: "3px solid white", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", transition: "background 0.4s" }} />
            )}

            {/* Personalisation preview */}
            {persOn && persText && (
              <div style={{ position: "absolute", bottom: imgCount > 1 ? 32 : 20, left: 20, right: 80, zIndex: 3, padding: "10px 16px", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: 3 }}>Stitched text</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic", color: "var(--ocean)" }}>{persText}</div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  flex: 1, aspectRatio: "1", position: "relative", overflow: "hidden",
                  border: "2px solid " + (activeImg === i ? "var(--cornflower)" : "rgba(0,0,0,0.05)"),
                  cursor: "pointer", padding: 0, background: "var(--sky-pale)",
                }}>
                  <Image src={img.url} alt={img.alt || ""} fill style={{ objectFit: "cover" }} sizes="10vw" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONFIGURE */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: accentColor, fontWeight: 500, marginBottom: 10 }}>{product.category}</div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px,3vw,38px)", fontWeight: 400, lineHeight: 1.12, marginBottom: 4 }}>{product.name}</h1>
          {product.subtitle && (
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(16px,2vw,22px)", fontStyle: "italic", color: "var(--ink-soft)", fontWeight: 400, marginBottom: 16 }}>{product.subtitle}</div>
          )}
          <div style={{ fontSize: 26, color: "var(--ocean)", fontWeight: 500, marginBottom: 24 }}>
            {"£" + (total / 100).toFixed(2)}
          </div>

          {/* Stitch divider */}
          <svg width="100%" height="8" style={{ marginBottom: 20 }}>
            <line x1="0" y1="4" x2="100%" y2="4" stroke="var(--sky-pale)" strokeWidth="1.5" strokeDasharray="6 8" className="stitch-animate" />
          </svg>

          {/* Tabs */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: 14 }}>
              {["story", "details", "delivery"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: "10px 18px", background: "none", border: "none",
                  borderBottom: tab === t ? "2px solid var(--cornflower)" : "2px solid transparent",
                  cursor: "pointer", fontSize: 11, fontWeight: tab === t ? 500 : 400,
                  letterSpacing: "0.06em", textTransform: "uppercase" as const,
                  color: tab === t ? "var(--ink)" : "var(--ink-soft)", marginBottom: -1,
                }}>{t}</button>
              ))}
            </div>
            {tab === "story" && product.description && <p style={{ fontSize: 14, lineHeight: 1.85, color: "var(--ink-mid)", fontWeight: 300 }}>{product.description}</p>}
            {tab === "details" && product.details && (
              <div>
                {product.details.map(d => (
                  <div key={d.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                    <span style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 300 }}>{d.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 400 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "delivery" && (
              <p style={{ fontSize: 14, lineHeight: 1.85, color: "var(--ink-mid)", fontWeight: 300 }}>
                {product.inStock ? "In stock - despatched next working day via first class post." : "Handmade to order in 5-7 working days."}{" "}
                {"UK delivery £5.99 via Royal Mail first class. International shipping available on request."}
              </p>
            )}
          </div>

          {/* FABRIC ZONE */}
          {product.hasFabricChoice && fabrics.length > 0 && (
            <div style={{ background: "var(--sand)", margin: "0 -clamp(16px,3vw,40px)", padding: "28px clamp(16px,3vw,40px)" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 500, marginBottom: 6 }}>Backing Fabric</div>
              {product.fabricNote && <p style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 300, marginBottom: 14, lineHeight: 1.5 }}>{product.fabricNote}</p>}

              {/* Custom fabric dropdown */}
              <div ref={fabricRef} style={{ position: "relative" }}>
                <button onClick={() => setFabricOpen(!fabricOpen)} style={{
                  width: "100%", padding: "10px 14px", background: "var(--white)", border: "1.5px solid " + (fabricOpen ? "var(--ocean)" : "rgba(0,0,0,0.1)"),
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" as const, transition: "border-color 0.2s",
                }}>
                  {fabric?.imageUrl ? (
                    <img src={fabric.imageUrl} alt={fabric.name} style={{ width: 44, height: 44, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, background: fabric?.hex || "#ccc", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{fabric?.name || "Select a fabric"}</div>
                    {fabric?.story && <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 300, lineHeight: 1.3, marginTop: 2 }}>{fabric.story}</div>}
                  </div>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transform: fabricOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M2 4l4 4 4-4" stroke="var(--ink-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>

                {fabricOpen && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: "var(--white)",
                    border: "1.5px solid var(--ocean)", borderTop: "none", maxHeight: 320, overflowY: "auto",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}>
                    {fabrics.map(f => (
                      <button key={f.id} onClick={() => { setFabric(f); setFabricOpen(false); }} style={{
                        width: "100%", padding: "10px 14px", border: "none", borderBottom: "1px solid rgba(0,0,0,0.04)",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" as const,
                        background: fabric?.id === f.id ? "rgba(58,111,143,0.06)" : "transparent",
                      }}>
                        {f.imageUrl ? (
                          <img src={f.imageUrl} alt={f.name} style={{ width: 44, height: 44, objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 44, height: 44, background: f.hex, flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: fabric?.id === f.id ? 500 : 400 }}>{f.name}</div>
                          {f.story && <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 300, lineHeight: 1.3, marginTop: 2 }}>{f.story}</div>}
                        </div>
                        {fabric?.id === f.id && (
                          <svg width="14" height="10" viewBox="0 0 10 8" fill="none" style={{ flexShrink: 0 }}><path d="M1 4l2.5 2.5L9 1" stroke="var(--ocean)" strokeWidth="1.5" strokeLinecap="round" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PERSONALISE ZONE */}
          {product.hasPersonalisation && (
            <div style={{ background: "var(--navy)", color: "white", margin: "0 -clamp(16px,3vw,40px)", padding: "28px clamp(16px,3vw,40px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 500 }}>Personalise</span>
                <span style={{ fontSize: 11, color: "var(--petal)" }}>{"+ £" + (product.personalisationPrice / 100).toFixed(2)}</span>
              </div>
              <button onClick={() => setPersOn(!persOn)} style={{
                width: "100%", padding: "14px 18px", textAlign: "left" as const,
                background: persOn ? "rgba(242,209,206,0.1)" : "rgba(255,255,255,0.04)",
                border: "1px solid " + (persOn ? "var(--petal)" : "rgba(255,255,255,0.08)"),
                color: persOn ? "var(--petal)" : "rgba(255,255,255,0.5)",
                cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 12,
                marginBottom: persOn ? 14 : 0, transition: "all 0.3s",
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: "1.5px solid " + (persOn ? "var(--petal)" : "rgba(255,255,255,0.2)"),
                  background: persOn ? "var(--petal)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.3s",
                }}>
                  {persOn && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                </div>
                <span>{persOn ? "Personalisation added" : (product.personalisationNote || "Add a name, date, or message")}</span>
              </button>

              {persOn && (
                <div>
                  <div style={{ position: "relative" }}>
                    <input
                      value={persText}
                      onChange={e => setPersText(e.target.value.slice(0, product.personalisationMaxChars))}
                      placeholder="e.g. Emily Rose, March 2025"
                      maxLength={product.personalisationMaxChars}
                      style={{
                        width: "100%", padding: "14px 50px 14px 16px",
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: 15, fontFamily: "var(--font-serif)", fontStyle: "italic",
                        color: "white", textAlign: "center" as const,
                      }}
                    />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: persText.length >= product.personalisationMaxChars - 5 ? "var(--rose)" : "rgba(255,255,255,0.2)" }}>
                      {persText.length}/{product.personalisationMaxChars}
                    </span>
                  </div>
                  {persText && (
                    <div style={{ marginTop: 12, textAlign: "center", padding: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Stitch preview</div>
                      <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontStyle: "italic", color: "var(--petal)" }}>{persText}</div>
                      <svg width="50%" height="6" style={{ margin: "10px auto 0", display: "block" }}>
                        <line x1="0" y1="3" x2="100%" y2="3" stroke="var(--cornflower)" strokeWidth="1" strokeDasharray="4 5" className="stitch-animate" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DROPDOWN + SIZE + PURCHASE */}
          <div style={{ paddingTop: 28 }}>
            {/* Custom dropdown */}
            {product.hasDropdown && product.dropdownOptions.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10, fontWeight: 500 }}>
                  {product.dropdownLabel || "Option"}
                </div>
                <div style={{ position: "relative" }}>
                  <select
                    value={dropdown?.label || ""}
                    onChange={(e) => { const d = product.dropdownOptions.find(o => o.label === e.target.value); if (d) setDropdown(d); }}
                    style={{
                      width: "100%", padding: "14px 40px 14px 16px", fontSize: 14,
                      border: "1.5px solid rgba(0,0,0,0.1)", background: "var(--white)",
                      cursor: "pointer", appearance: "none", fontFamily: "inherit", color: "var(--ink)",
                    }}
                  >
                    {product.dropdownOptions.map(d => (
                      <option key={d.label} value={d.label}>
                        {d.label}{d.priceAdd > 0 ? ` (+£${(d.priceAdd / 100).toFixed(2)})` : ""}
                      </option>
                    ))}
                  </select>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><path d="M2 4l4 4 4-4" stroke="var(--ink-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            )}

            {product.hasSizeOptions && product.sizeOptions.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10, fontWeight: 500 }}>
                  {isBunting ? "Number of Letters" : "Size"}
                </div>
                <div style={{ position: "relative" }}>
                  <select
                    value={size?.label || ""}
                    onChange={(e) => { const s = product.sizeOptions.find(o => o.label === e.target.value); if (s) setSize(s); }}
                    style={{
                      width: "100%", padding: "14px 40px 14px 16px", fontSize: 14,
                      border: "1.5px solid rgba(0,0,0,0.1)", background: "var(--white)",
                      cursor: "pointer", appearance: "none", fontFamily: "inherit", color: "var(--ink)",
                    }}
                  >
                    {product.sizeOptions.map(s => (
                      <option key={s.label} value={s.label}>
                        {s.label}{s.dimensions ? ` — ${s.dimensions}` : ""}{isBunting ? ` — £${((product.price + s.priceAdd) / 100).toFixed(2)}` : s.priceAdd > 0 ? ` (+£${(s.priceAdd / 100).toFixed(2)})` : ""}
                      </option>
                    ))}
                  </select>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><path d="M2 4l4 4 4-4" stroke="var(--ink-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            )}

            {/* Qty + Add */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ display: "flex", border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }}>
                {[{ l: "-", d: -1 }, { l: String(qty), d: 0 }, { l: "+", d: 1 }].map((b, i) => (
                  <button key={i} onClick={b.d !== 0 ? () => setQty(Math.max(1, qty + b.d)) : undefined} style={{
                    width: b.d === 0 ? 40 : 36, height: 48, border: "none",
                    borderRight: i < 2 ? "1px solid rgba(0,0,0,0.06)" : "none",
                    background: b.d === 0 ? "rgba(0,0,0,0.02)" : "none",
                    cursor: b.d !== 0 ? "pointer" : "default",
                    fontSize: b.d === 0 ? 15 : 18, color: "var(--ink)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: b.d === 0 ? 500 : 300,
                  }}>{b.l}</button>
                ))}
              </div>
              <button onClick={handleAdd} style={{
                flex: 1, padding: 14, background: added ? "var(--ocean)" : "var(--ink)",
                color: "white", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 500, letterSpacing: "0.06em",
                textTransform: "uppercase" as const, transition: "all 0.4s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {added ? "Added to Bag" : "Add to Bag - £" + (total / 100).toFixed(2)}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(107,159,204,0.06)" }}>
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6h12M7 1l5 5-5 5" stroke="var(--cornflower)" strokeWidth="1" /></svg>
              <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 300 }}>
                {"UK delivery £5.99"}
                {product.inStock ? " - In stock, ships next day" : " - Handmade in 5-7 days"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom lightbox */}
      {zoomed && product.images[activeImg] && (
        <div
          onClick={() => setZoomed(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={(e) => { onTouchEnd(e); }}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}
        >
          <button onClick={() => setZoomed(false)} style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", color: "white", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>

          {imgCount > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImg(); }} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", zIndex: 5, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImg(); }} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 5, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </>
          )}

          <div style={{ position: "relative", width: "90vw", height: "90vh", maxWidth: 1200 }} onClick={(e) => e.stopPropagation()}>
            <Image
              src={product.images[activeImg].url}
              alt={product.images[activeImg].alt || product.name}
              fill
              style={{ objectFit: "contain", cursor: "zoom-out" }}
              sizes="90vw"
              onClick={() => setZoomed(false)}
            />
          </div>

          {imgCount > 1 && (
            <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 5 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{activeImg + 1} / {imgCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
