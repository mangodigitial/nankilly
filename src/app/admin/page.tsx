"use client";

import { useState, useEffect } from "react";
import ProductEditor from "@/components/admin/ProductEditor";

type Order = {
  id: string; orderNumber: string; status: string; customerName: string;
  customerEmail: string; total: number; createdAt: string; addressLine1: string;
  city: string; postcode: string;
  items: { productName: string; quantity: number; sizeName?: string | null; fabricName?: string | null; personalisation?: string | null; dropdownChoice?: string | null }[];
};

type Product = {
  id: string; name: string; slug: string; price: number; active: boolean;
  featured: boolean; badge?: string | null;
  category: { name: string }; images: { url: string }[];
};

type Message = {
  id: string; name: string; email: string; subject: string; message: string;
  read: boolean; createdAt: string;
};

type SiteImage = {
  id: string; key: string; label: string; url: string | null; alt: string | null;
};

type Fabric = {
  id: string; name: string; hex: string; pattern: string; story: string | null;
  imageUrl: string | null; active: boolean; sortOrder: number;
};

type Category = {
  id: string; name: string; slug: string; imageUrl: string | null;
  _count: { products: number };
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B", paid: "#3B82F6", making: "#8B5CF6",
  shipped: "#10B981", delivered: "#6B7280",
};

const STATUSES = ["paid", "making", "shipped", "delivered"];

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState<"orders" | "products" | "messages" | "images" | "fabrics">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [uploadingSiteImage, setUploadingSiteImage] = useState<string | null>(null);
  const [allFabrics, setAllFabrics] = useState<Fabric[]>([]);
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null);
  const [fabricForm, setFabricForm] = useState({ name: "", hex: "#6B9FCC", pattern: "solid", story: "", imageUrl: "" });
  const [uploadingFabricImg, setUploadingFabricImg] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [uploadingCatImg, setUploadingCatImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null); // null = closed, "new" = new, id = editing
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const login = async () => {
    setLoginErr("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });
    if (res.ok) { setLoggedIn(true); loadAll(); }
    else setLoginErr("Invalid email or password");
  };

  const loadAll = async () => {
    setLoading(true);
    const [oR, pR, mR, siR, fR, cR] = await Promise.all([
      fetch("/api/admin/orders"),
      fetch("/api/admin/products"),
      fetch("/api/admin/messages"),
      fetch("/api/admin/site-images"),
      fetch("/api/admin/fabrics"),
      fetch("/api/admin/categories"),
    ]);
    if (oR.ok) setOrders(await oR.json());
    if (pR.ok) setProducts(await pR.json());
    if (mR.ok) setMessages(await mR.json());
    if (siR.ok) setSiteImages(await siR.json());
    if (fR.ok) setAllFabrics(await fR.json());
    if (cR.ok) setAllCategories(await cR.json());
    setLoading(false);
  };

  const uploadSiteImage = async (key: string, file: File) => {
    setUploadingSiteImage(key);
    const form = new FormData();
    form.append("file", file);
    const upRes = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (!upRes.ok) { setUploadingSiteImage(null); return; }
    const { url } = await upRes.json();
    await fetch("/api/admin/site-images", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, url }),
    });
    setUploadingSiteImage(null);
    loadAll();
  };

  const removeSiteImage = async (key: string) => {
    await fetch("/api/admin/site-images", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, url: null, alt: null }),
    });
    loadAll();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    loadAll();
  };

  const markRead = async (id: string) => {
    await fetch("/api/admin/messages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, read: true }) });
    loadAll();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch("/api/admin/products?id=" + id, { method: "DELETE" });
    loadAll();
  };

  useEffect(() => {
    fetch("/api/admin/orders").then((r) => { if (r.ok) { setLoggedIn(true); loadAll(); } });
  }, []);

  const unreadCount = messages.filter((m) => !m.read).length;
  const paidOrders = orders.filter((o) => o.status === "paid").length;

  // ── LOGIN ──
  if (!loggedIn) {
    return (
      <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF6F0" }}>
        <div style={{ width: 360, padding: 40, background: "white", border: "1px solid rgba(0,0,0,0.06)" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 8 }}>Nankilly</h1>
          <p style={{ fontSize: 13, color: "#7A7670", marginBottom: 28, fontWeight: 300 }}>Admin login</p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 6 }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "1px solid rgba(0,0,0,0.1)", fontSize: 14, background: "white" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
            <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" onKeyDown={(e) => e.key === "Enter" && login()} style={{ width: "100%", padding: "12px 14px", border: "1px solid rgba(0,0,0,0.1)", fontSize: 14, background: "white" }} />
          </div>
          {loginErr && <p style={{ fontSize: 12, color: "#C97B7B", marginBottom: 12 }}>{loginErr}</p>}
          <button onClick={login} style={{ width: "100%", padding: 14, background: "#1E1E1C", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Sign In</button>
        </div>
      </div>
    );
  }

  // ── PRODUCT EDITOR OVERLAY ──
  if (editingProduct !== null) {
    return (
      <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: "100vh", background: "#FAF6F0", padding: "32px 24px" }}>
        <ProductEditor
          productId={editingProduct === "new" ? undefined : editingProduct}
          onDone={() => { setEditingProduct(null); loadAll(); }}
        />
      </div>
    );
  }

  // ── DASHBOARD ──
  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: "100vh", background: "#FAF6F0" }}>
      {/* Nav */}
      <div style={{ background: "#1C3A52", padding: "0 32px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, color: "white" }}>Nankilly</span>
          <span style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(["orders", "products", "fabrics", "messages", "images"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", background: tab === t ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none", color: tab === t ? "white" : "rgba(255,255,255,0.5)",
              cursor: "pointer", fontSize: 11, fontWeight: tab === t ? 500 : 400,
              letterSpacing: "0.06em", textTransform: "uppercase",
              position: "relative",
            }}>
              {t}
              {t === "orders" && paidOrders > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: "#3B82F6" }} />}
              {t === "messages" && unreadCount > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: "#E0A4A0" }} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {loading && <p style={{ fontSize: 13, color: "#7A7670" }}>Loading...</p>}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 24 }}>
              Orders ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <p style={{ fontSize: 14, color: "#7A7670", fontWeight: 300 }}>No orders yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {orders.map((o) => (
                  <div key={o.id} style={{ background: "white", border: "1px solid rgba(0,0,0,0.04)", padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }} onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 500 }}>{o.orderNumber}</span>
                          <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", fontWeight: 600, background: (STATUS_COLORS[o.status] || "#6B7280") + "18", color: STATUS_COLORS[o.status] || "#6B7280" }}>{o.status}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#7A7670", fontWeight: 300 }}>{o.customerName} - {o.customerEmail}</div>
                        <div style={{ fontSize: 11, color: "#B5AFA8", fontWeight: 300, marginTop: 4 }}>
                          {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: "#3A6F8F" }}>
                        {"£" + (o.total / 100).toFixed(2)}
                      </div>
                    </div>

                    {expandedOrder === o.id && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                        {/* Address */}
                        <div style={{ fontSize: 12, color: "#7A7670", fontWeight: 300, marginBottom: 12, lineHeight: 1.6 }}>
                          {o.addressLine1}, {o.city}, {o.postcode}
                        </div>

                        {/* Items */}
                        {o.items.map((item, i) => (
                          <div key={i} style={{ fontSize: 13, color: "#4A4845", padding: "6px 0", borderBottom: i < o.items.length - 1 ? "1px solid rgba(0,0,0,0.02)" : "none" }}>
                            <span style={{ fontWeight: 400 }}>{item.quantity}x {item.productName}</span>
                            {(item.sizeName || item.fabricName || item.dropdownChoice) && (
                              <span style={{ color: "#7A7670", fontWeight: 300 }}>{" / " + [item.sizeName, item.fabricName, item.dropdownChoice].filter(Boolean).join(" / ")}</span>
                            )}
                            {item.personalisation && <div style={{ color: "#3A6F8F", fontStyle: "italic", fontSize: 12, marginTop: 2 }}>{'"' + item.personalisation + '"'}</div>}
                          </div>
                        ))}

                        {/* Status actions */}
                        <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
                          {STATUSES.map((s) => (
                            <button key={s} onClick={() => updateStatus(o.id, s)} disabled={o.status === s} style={{
                              padding: "7px 16px", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
                              border: "1px solid " + (o.status === s ? "transparent" : "rgba(0,0,0,0.08)"),
                              background: o.status === s ? (STATUS_COLORS[s] || "#6B7280") : "transparent",
                              color: o.status === s ? "white" : "#7A7670",
                              cursor: o.status === s ? "default" : "pointer", fontWeight: o.status === s ? 600 : 400,
                            }}>{s}</button>
                          ))}
                        </div>
                        {o.status === "paid" && (
                          <p style={{ fontSize: 11, color: "#7A7670", fontWeight: 300, marginTop: 10, fontStyle: "italic" }}>
                            Marking as "shipped" will automatically email the customer.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400 }}>Products ({products.length})</h2>
              <button onClick={() => setEditingProduct("new")} style={{ padding: "10px 24px", background: "#1E1E1C", color: "white", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                + Add Product
              </button>
            </div>
            {products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontSize: 14, color: "#7A7670", fontWeight: 300, marginBottom: 16 }}>No products yet.</p>
                <button onClick={() => setEditingProduct("new")} style={{ padding: "12px 28px", background: "#1E1E1C", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {products.map((p) => (
                  <div key={p.id} style={{ background: "white", border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
                    <div style={{ height: 150, background: "#D6E8F0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {p.images[0] ? (
                        <img src={p.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 11, color: "#7A7670", textTransform: "uppercase" }}>No image</span>
                      )}
                    </div>
                    <div style={{ padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 400, marginBottom: 2 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "#7A7670", fontWeight: 300 }}>{p.category.name}</div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#3A6F8F" }}>{"£" + (p.price / 100).toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setEditingProduct(p.id)} style={{ flex: 1, padding: "8px", border: "1px solid rgba(0,0,0,0.08)", background: "none", cursor: "pointer", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7670" }}>Edit</button>
                        <button onClick={() => deleteProduct(p.id)} style={{ padding: "8px 12px", border: "1px solid rgba(0,0,0,0.08)", background: "none", cursor: "pointer", fontSize: 10, color: "#C97B7B" }}>x</button>
                        <span style={{ padding: "8px 10px", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, background: p.active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: p.active ? "#10B981" : "#EF4444", display: "flex", alignItems: "center" }}>
                          {p.active ? "Live" : "Draft"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FABRICS ── */}
        {tab === "fabrics" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400 }}>Fabrics ({allFabrics.length})</h2>
              <button onClick={() => { setEditingFabric(null); setFabricForm({ name: "", hex: "#6B9FCC", pattern: "solid", story: "", imageUrl: "" }); }} style={{ padding: "10px 24px", background: "#1E1E1C", color: "white", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                + Add Fabric
              </button>
            </div>

            {/* Fabric form */}
            <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.04)", padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>{editingFabric ? "Edit: " + editingFabric.name : "Add New Fabric"}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 4 }}>Name</label>
                  <input value={fabricForm.name} onChange={(e) => setFabricForm({ ...fabricForm, name: e.target.value })} placeholder="Liberty Betsy" style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 4 }}>Colour (hex)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="color" value={fabricForm.hex} onChange={(e) => setFabricForm({ ...fabricForm, hex: e.target.value })} style={{ width: 40, height: 38, border: "1px solid rgba(0,0,0,0.1)", padding: 2, cursor: "pointer" }} />
                    <input value={fabricForm.hex} onChange={(e) => setFabricForm({ ...fabricForm, hex: e.target.value })} style={{ flex: 1, padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }} />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 4 }}>Description</label>
                <input value={fabricForm.story} onChange={(e) => setFabricForm({ ...fabricForm, story: e.target.value })} placeholder="Timeless Liberty floral. Soft pinks and dusky roses." style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: 4 }}>Fabric Image</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {fabricForm.imageUrl && <img src={fabricForm.imageUrl} alt="" style={{ width: 60, height: 60, objectFit: "cover" }} />}
                  <label style={{ padding: "8px 16px", border: "1px solid rgba(0,0,0,0.08)", cursor: "pointer", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7670" }}>
                    {uploadingFabricImg ? "Uploading..." : fabricForm.imageUrl ? "Replace Image" : "Upload Image"}
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingFabricImg(true);
                      const form = new FormData();
                      form.append("file", file);
                      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
                      if (res.ok) { const { url } = await res.json(); setFabricForm((f) => ({ ...f, imageUrl: url })); }
                      setUploadingFabricImg(false);
                    }} style={{ display: "none" }} />
                  </label>
                  {fabricForm.imageUrl && <button onClick={() => setFabricForm({ ...fabricForm, imageUrl: "" })} style={{ fontSize: 10, color: "#C97B7B", background: "none", border: "none", cursor: "pointer" }}>Remove</button>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={async () => {
                  const payload = { ...fabricForm, story: fabricForm.story || null, imageUrl: fabricForm.imageUrl || null };
                  if (editingFabric) {
                    await fetch("/api/admin/fabrics", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingFabric.id, ...payload }) });
                  } else {
                    await fetch("/api/admin/fabrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                  }
                  setEditingFabric(null);
                  setFabricForm({ name: "", hex: "#6B9FCC", pattern: "solid", story: "", imageUrl: "" });
                  loadAll();
                }} style={{ padding: "10px 24px", background: "#1E1E1C", color: "white", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {editingFabric ? "Update" : "Add"} Fabric
                </button>
                {editingFabric && <button onClick={() => { setEditingFabric(null); setFabricForm({ name: "", hex: "#6B9FCC", pattern: "solid", story: "", imageUrl: "" }); }} style={{ padding: "10px 24px", background: "none", border: "1px solid rgba(0,0,0,0.08)", cursor: "pointer", fontSize: 11, color: "#7A7670" }}>Cancel</button>}
              </div>
            </div>

            {/* Fabric list */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {allFabrics.map((f) => (
                <div key={f.id} style={{ background: "white", border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
                  <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                    {f.imageUrl ? (
                      <img src={f.imageUrl} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: f.hex }} />
                    )}
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{f.name}</div>
                    {f.story && <div style={{ fontSize: 11, color: "#7A7670", fontWeight: 300, lineHeight: 1.4, marginBottom: 8 }}>{f.story}</div>}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditingFabric(f); setFabricForm({ name: f.name, hex: f.hex, pattern: f.pattern, story: f.story || "", imageUrl: f.imageUrl || "" }); }} style={{ flex: 1, padding: "6px", border: "1px solid rgba(0,0,0,0.08)", background: "none", cursor: "pointer", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7670" }}>Edit</button>
                      <button onClick={async () => { if (!confirm("Delete " + f.name + "?")) return; await fetch("/api/admin/fabrics?id=" + f.id, { method: "DELETE" }); loadAll(); }} style={{ padding: "6px 10px", border: "1px solid rgba(0,0,0,0.08)", background: "none", cursor: "pointer", fontSize: 10, color: "#C97B7B" }}>x</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SITE IMAGES ── */}
        {tab === "images" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 8 }}>Site Images</h2>
            <p style={{ fontSize: 13, color: "#7A7670", fontWeight: 300, marginBottom: 28 }}>Upload images for pages across the site. Changes appear immediately.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {siteImages.map((si) => (
                <div key={si.key} style={{ background: "white", border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
                  <div style={{ height: 200, background: "#D6E8F0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                    {si.url ? (
                      <>
                        <img src={si.url} alt={si.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button onClick={() => removeSiteImage(si.key)} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "white", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: "#7A7670", textTransform: "uppercase" }}>No image</span>
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 400, marginBottom: 4 }}>{si.label}</div>
                    <div style={{ fontSize: 11, color: "#B5AFA8", marginBottom: 12 }}>{si.key}</div>
                    <label style={{ display: "inline-block", padding: "8px 16px", border: "1px solid rgba(0,0,0,0.08)", cursor: "pointer", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7670" }}>
                      {uploadingSiteImage === si.key ? "Uploading..." : si.url ? "Replace" : "Upload"}
                      <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) uploadSiteImage(si.key, e.target.files[0]); }} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            {siteImages.length === 0 && !loading && (
              <p style={{ fontSize: 14, color: "#7A7670", fontWeight: 300 }}>No image slots found. Run database seed to create them.</p>
            )}

            {/* Category images */}
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginTop: 40, marginBottom: 8 }}>Category Images</h2>
            <p style={{ fontSize: 13, color: "#7A7670", fontWeight: 300, marginBottom: 20 }}>Shown on the homepage "Shop by category" section.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {allCategories.map((cat) => (
                <div key={cat.id} style={{ background: "white", border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
                  <div style={{ height: 120, background: "#D6E8F0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                    {cat.imageUrl ? (
                      <>
                        <img src={cat.imageUrl} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button onClick={async () => { await fetch("/api/admin/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: cat.id, imageUrl: null }) }); loadAll(); }} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "white", border: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: "#7A7670", textTransform: "uppercase" }}>No image</span>
                    )}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{cat.name}</div>
                    <div style={{ fontSize: 11, color: "#B5AFA8", marginBottom: 10 }}>{cat._count.products} products</div>
                    <label style={{ display: "inline-block", padding: "6px 14px", border: "1px solid rgba(0,0,0,0.08)", cursor: "pointer", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7670" }}>
                      {uploadingCatImg === cat.id ? "Uploading..." : cat.imageUrl ? "Replace" : "Upload"}
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingCatImg(cat.id);
                        const form = new FormData();
                        form.append("file", file);
                        const upRes = await fetch("/api/admin/upload", { method: "POST", body: form });
                        if (upRes.ok) {
                          const { url } = await upRes.json();
                          await fetch("/api/admin/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: cat.id, imageUrl: url }) });
                        }
                        setUploadingCatImg(null);
                        loadAll();
                      }} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 24 }}>
              Messages ({messages.length})
              {unreadCount > 0 && <span style={{ fontSize: 13, fontWeight: 300, color: "#E0A4A0", marginLeft: 8 }}>{unreadCount} unread</span>}
            </h2>
            {messages.length === 0 ? (
              <p style={{ fontSize: 14, color: "#7A7670", fontWeight: 300 }}>No messages yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {messages.map((m) => (
                  <div key={m.id} style={{
                    background: "white", border: "1px solid rgba(0,0,0,0.04)",
                    padding: 22, borderLeft: m.read ? "none" : "3px solid #E0A4A0",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: m.read ? 400 : 600 }}>{m.name}</span>
                          <span style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7670", fontWeight: 300 }}>{m.subject}</span>
                          {!m.read && <span style={{ fontSize: 8, padding: "2px 6px", background: "#E0A4A0", color: "white", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>New</span>}
                        </div>
                        <a href={"mailto:" + m.email} style={{ fontSize: 12, color: "#3A6F8F" }}>{m.email}</a>
                      </div>
                      <div style={{ fontSize: 11, color: "#B5AFA8", fontWeight: 300 }}>
                        {new Date(m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: "#4A4845", fontWeight: 300 }}>{m.message}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <a href={"mailto:" + m.email} style={{ padding: "6px 14px", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid rgba(0,0,0,0.08)", color: "#3A6F8F", fontWeight: 500 }}>Reply</a>
                      {!m.read && (
                        <button onClick={() => markRead(m.id)} style={{ padding: "6px 14px", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid rgba(0,0,0,0.08)", background: "none", cursor: "pointer", color: "#7A7670" }}>Mark read</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
