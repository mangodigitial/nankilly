"use client";

import { useState, useEffect } from "react";

type Category = { id: string; name: string; slug: string };
type ProductForm = {
  id?: string;
  name: string;
  subtitle: string;
  slug: string;
  description: string;
  price: string;
  categoryId: string;
  badge: string;
  active: boolean;
  featured: boolean;
  inStock: boolean;
  hasPersonalisation: boolean;
  personalisationPrice: string;
  personalisationNote: string;
  personalisationMaxChars: string;
  hasFabricChoice: boolean;
  fabricNote: string;
  fabricIds: string[];
  hasSizeOptions: boolean;
  hasDropdown: boolean;
  dropdownLabel: string;
  images: { url: string; alt: string }[];
  sizeOptions: { label: string; dimensions: string; priceAdd: string }[];
  dropdownOptions: { label: string; priceAdd: string }[];
  details: { label: string; value: string }[];
};

const empty: ProductForm = {
  name: "", subtitle: "", slug: "", description: "", price: "",
  categoryId: "", badge: "", active: true, featured: false, inStock: false,
  hasPersonalisation: false, personalisationPrice: "5.00", personalisationNote: "", personalisationMaxChars: "25",
  hasFabricChoice: false, fabricNote: "", fabricIds: [],
  hasSizeOptions: false,
  hasDropdown: false, dropdownLabel: "",
  images: [], sizeOptions: [], dropdownOptions: [], details: [],
};

export default function ProductEditor({ productId, onDone }: { productId?: string; onDone: () => void }) {
  const [form, setForm] = useState<ProductForm>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allFabrics, setAllFabrics] = useState<{ id: string; name: string; imageUrl: string | null; hex: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load fabrics
    fetch("/api/admin/fabrics").then(async (r) => {
      if (r.ok) setAllFabrics(await r.json());
    });

    if (productId) {
      fetch("/api/admin/products").then(async (r) => {
        if (!r.ok) return;
        const products = await r.json();
        const p = products.find((pr: { id: string }) => pr.id === productId);
        if (p) {
          setForm({
            id: p.id, name: p.name, subtitle: p.subtitle || "",
            slug: p.slug, description: p.description || "",
            price: (p.price / 100).toFixed(2),
            categoryId: p.categoryId, badge: p.badge || "",
            active: p.active, featured: p.featured, inStock: p.inStock,
            hasPersonalisation: p.hasPersonalisation,
            personalisationPrice: (p.personalisationPrice / 100).toFixed(2),
            personalisationNote: p.personalisationNote || "",
            personalisationMaxChars: String(p.personalisationMaxChars),
            hasFabricChoice: p.hasFabricChoice,
            fabricNote: p.fabricNote || "",
            fabricIds: p.fabrics?.map((f: { id: string }) => f.id) || [],
            hasSizeOptions: p.hasSizeOptions,
            hasDropdown: p.hasDropdown,
            dropdownLabel: p.dropdownLabel || "",
            images: p.images?.map((i: { url: string; alt?: string }) => ({ url: i.url, alt: i.alt || "" })) || [],
            sizeOptions: p.sizeOptions?.map((s: { label: string; dimensions: string; priceAdd: number }) => ({
              label: s.label, dimensions: s.dimensions, priceAdd: (s.priceAdd / 100).toFixed(2),
            })) || [],
            dropdownOptions: p.dropdownOptions?.map((d: { label: string; priceAdd: number }) => ({
              label: d.label, priceAdd: (d.priceAdd / 100).toFixed(2),
            })) || [],
            details: (p.details as { label: string; value: string }[]) || [],
          });
          if (p.category) setCategories([p.category]);
        }
      });
    }
  }, [productId]);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((p) => ({ ...p, images: [...p.images, { url: data.url, alt: "" }] }));
      }
    } catch (e) {
      alert("Upload failed");
    }
    setUploading(false);
  };

  const removeImage = (idx: number) => setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));

  const addSize = () => setForm((p) => ({ ...p, sizeOptions: [...p.sizeOptions, { label: "", dimensions: "", priceAdd: "0" }] }));
  const removeSize = (idx: number) => setForm((p) => ({ ...p, sizeOptions: p.sizeOptions.filter((_, i) => i !== idx) }));
  const updateSize = (idx: number, k: string, v: string) => setForm((p) => ({ ...p, sizeOptions: p.sizeOptions.map((s, i) => i === idx ? { ...s, [k]: v } : s) }));

  const addDropdownOpt = () => setForm((p) => ({ ...p, dropdownOptions: [...p.dropdownOptions, { label: "", priceAdd: "0" }] }));
  const removeDropdownOpt = (idx: number) => setForm((p) => ({ ...p, dropdownOptions: p.dropdownOptions.filter((_, i) => i !== idx) }));
  const updateDropdownOpt = (idx: number, k: string, v: string) => setForm((p) => ({ ...p, dropdownOptions: p.dropdownOptions.map((d, i) => i === idx ? { ...d, [k]: v } : d) }));

  const addDetail = () => setForm((p) => ({ ...p, details: [...p.details, { label: "", value: "" }] }));
  const removeDetail = (idx: number) => setForm((p) => ({ ...p, details: p.details.filter((_, i) => i !== idx) }));
  const updateDetail = (idx: number, k: string, v: string) => setForm((p) => ({ ...p, details: p.details.map((d, i) => i === idx ? { ...d, [k]: v } : d) }));

  const save = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      alert("Name, price, and category are required");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || autoSlug(form.name),
      price: Math.round(parseFloat(form.price) * 100),
      personalisationPrice: Math.round(parseFloat(form.personalisationPrice || "5") * 100),
      personalisationMaxChars: parseInt(form.personalisationMaxChars || "25"),
      sizeOptions: form.sizeOptions.map((s) => ({
        label: s.label, dimensions: s.dimensions,
        priceAdd: Math.round(parseFloat(s.priceAdd || "0") * 100),
      })),
      dropdownOptions: form.dropdownOptions.map((d) => ({
        label: d.label,
        priceAdd: Math.round(parseFloat(d.priceAdd || "0") * 100),
      })),
    };

    const method = form.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onDone();
    } else {
      alert("Failed to save");
    }
    setSaving(false);
  };

  const labelStyle: React.CSSProperties = { fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 6, color: "#4A4845" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", fontSize: 13, background: "white" };
  const checkStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, padding: "8px 0" };

  return (
    <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", padding: 32, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400 }}>
          {form.id ? "Edit Product" : "New Product"}
        </h2>
        <button onClick={onDone} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#7A7670" }}>x</button>
      </div>

      {/* Basic info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Name *</label>
          <input value={form.name} onChange={(e) => { set("name", e.target.value); if (!form.id) set("slug", autoSlug(e.target.value)); }} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Subtitle</label>
          <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="e.g. Peonies and Forget-Me-Nots" style={inputStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>{"Price (£) *"}</label>
          <input value={form.price} onChange={(e) => set("price", e.target.value)} type="number" step="0.01" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Category *</label>
          <input value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} placeholder="Category ID" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Badge</label>
          <input value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="New, Bespoke, Limited" style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Slug</label>
        <input value={form.slug} onChange={(e) => set("slug", e.target.value)} style={{ ...inputStyle, color: "#7A7670" }} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
      </div>

      {/* Toggles */}
      <div style={{ marginBottom: 24, padding: "16px 0", borderTop: "1px solid rgba(0,0,0,0.04)", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
        {[
          { k: "active", l: "Active (visible on site)" },
          { k: "featured", l: "Featured (show on homepage)" },
          { k: "inStock", l: "In stock (ships next day, not made to order)" },
          { k: "hasFabricChoice", l: "Has fabric choice" },
          { k: "hasPersonalisation", l: "Has personalisation" },
          { k: "hasSizeOptions", l: "Has size options" },
          { k: "hasDropdown", l: "Has dropdown selector (e.g. Design, Colour Way)" },
        ].map((t) => (
          <label key={t.k} style={checkStyle}>
            <input type="checkbox" checked={(form as Record<string, unknown>)[t.k] as boolean} onChange={(e) => set(t.k, e.target.checked)} />
            {t.l}
          </label>
        ))}
      </div>

      {/* Personalisation settings */}
      {form.hasPersonalisation && (
        <div style={{ padding: 20, background: "#F5EFE6", marginBottom: 20 }}>
          <h4 style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Personalisation Settings</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>{"Price (£)"}</label>
              <input value={form.personalisationPrice} onChange={(e) => set("personalisationPrice", e.target.value)} type="number" step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Max characters</label>
              <input value={form.personalisationMaxChars} onChange={(e) => set("personalisationMaxChars", e.target.value)} type="number" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Note shown to customer</label>
            <input value={form.personalisationNote} onChange={(e) => set("personalisationNote", e.target.value)} placeholder="Add a name, date, or message" style={inputStyle} />
          </div>
        </div>
      )}

      {/* Fabric settings */}
      {form.hasFabricChoice && (
        <div style={{ padding: 20, background: "#F0E6D8", marginBottom: 20 }}>
          <h4 style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fabric Choice Settings</h4>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Note shown to customer</label>
            <input value={form.fabricNote} onChange={(e) => set("fabricNote", e.target.value)} placeholder="Choose the backing fabric" style={inputStyle} />
          </div>
          <label style={labelStyle}>Available fabrics (none selected = show all)</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginTop: 6 }}>
            {allFabrics.map((f) => (
              <label key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: form.fabricIds.includes(f.id) ? "rgba(58,111,143,0.08)" : "white", border: "1px solid rgba(0,0,0,0.06)", cursor: "pointer", fontSize: 12 }}>
                <input type="checkbox" checked={form.fabricIds.includes(f.id)} onChange={(e) => {
                  if (e.target.checked) set("fabricIds", [...form.fabricIds, f.id]);
                  else set("fabricIds", form.fabricIds.filter((id: string) => id !== f.id));
                }} />
                {f.imageUrl ? (
                  <img src={f.imageUrl} alt="" style={{ width: 24, height: 24, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 24, height: 24, background: f.hex, flexShrink: 0 }} />
                )}
                {f.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Size options */}
      {form.hasSizeOptions && (
        <div style={{ padding: 20, background: "#D6E8F0", marginBottom: 20 }}>
          <h4 style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Size Options</h4>
          {form.sizeOptions.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 30px", gap: 8, marginBottom: 8 }}>
              <input value={s.label} onChange={(e) => updateSize(i, "label", e.target.value)} placeholder="Standard" style={inputStyle} />
              <input value={s.dimensions} onChange={(e) => updateSize(i, "dimensions", e.target.value)} placeholder="45x45cm" style={inputStyle} />
              <input value={s.priceAdd} onChange={(e) => updateSize(i, "priceAdd", e.target.value)} placeholder="+0" type="number" step="0.01" style={inputStyle} />
              <button onClick={() => removeSize(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#C97B7B" }}>x</button>
            </div>
          ))}
          <button onClick={addSize} style={{ padding: "8px 16px", border: "1px dashed rgba(0,0,0,0.15)", background: "none", cursor: "pointer", fontSize: 11, color: "#7A7670" }}>
            + Add size
          </button>
        </div>
      )}

      {/* Dropdown options */}
      {form.hasDropdown && (
        <div style={{ padding: 20, background: "#E8E0D4", marginBottom: 20 }}>
          <h4 style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Dropdown Options</h4>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Dropdown Label (shown to customer)</label>
            <input value={form.dropdownLabel} onChange={(e) => set("dropdownLabel", e.target.value)} placeholder="e.g. Design, Colour Way, Style" style={inputStyle} />
          </div>
          {form.dropdownOptions.map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 30px", gap: 8, marginBottom: 8 }}>
              <input value={d.label} onChange={(e) => updateDropdownOpt(i, "label", e.target.value)} placeholder="Option name" style={inputStyle} />
              <input value={d.priceAdd} onChange={(e) => updateDropdownOpt(i, "priceAdd", e.target.value)} placeholder="+0" type="number" step="0.01" style={inputStyle} />
              <button onClick={() => removeDropdownOpt(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#C97B7B" }}>x</button>
            </div>
          ))}
          <button onClick={addDropdownOpt} style={{ padding: "8px 16px", border: "1px dashed rgba(0,0,0,0.15)", background: "none", cursor: "pointer", fontSize: 11, color: "#7A7670" }}>
            + Add option
          </button>
        </div>
      )}

      {/* Product details */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Product Details</h4>
        {form.details.map((d, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 30px", gap: 8, marginBottom: 8 }}>
            <input value={d.label} onChange={(e) => updateDetail(i, "label", e.target.value)} placeholder="Size" style={inputStyle} />
            <input value={d.value} onChange={(e) => updateDetail(i, "value", e.target.value)} placeholder="45 x 45cm" style={inputStyle} />
            <button onClick={() => removeDetail(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#C97B7B" }}>x</button>
          </div>
        ))}
        <button onClick={addDetail} style={{ padding: "8px 16px", border: "1px dashed rgba(0,0,0,0.15)", background: "none", cursor: "pointer", fontSize: 11, color: "#7A7670" }}>
          + Add detail
        </button>
      </div>

      {/* Images */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Images</h4>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          {form.images.map((img, i) => (
            <div key={i} style={{ width: 100, height: 100, position: "relative", border: "1px solid rgba(0,0,0,0.06)" }}>
              <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => removeImage(i)} style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "white", border: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                x
              </button>
            </div>
          ))}
        </div>
        <label style={{ display: "inline-block", padding: "10px 20px", border: "1px dashed rgba(0,0,0,0.15)", cursor: "pointer", fontSize: 12, color: "#7A7670" }}>
          {uploading ? "Uploading..." : "+ Upload image"}
          <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} style={{ display: "none" }} />
        </label>
      </div>

      {/* Save */}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={save} disabled={saving} style={{
          padding: "14px 36px", background: "#1E1E1C", color: "white",
          border: "none", cursor: saving ? "not-allowed" : "pointer",
          fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase",
          opacity: saving ? 0.5 : 1,
        }}>
          {saving ? "Saving..." : form.id ? "Update Product" : "Create Product"}
        </button>
        <button onClick={onDone} style={{ padding: "14px 24px", border: "1px solid rgba(0,0,0,0.1)", background: "none", cursor: "pointer", fontSize: 12, color: "#7A7670", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
