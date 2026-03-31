"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import CartDrawer from "./CartDrawer";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logos, setLogos] = useState<{ logo_dark: string | null; logo_light: string | null }>({ logo_dark: null, logo_light: null });
  const pathname = usePathname();
  const count = useCart((s) => s.count());
  const isHome = pathname === "/";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    fetch("/api/logos").then(r => r.json()).then(setLogos).catch(() => {});
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const transparent = isHome && !scrolled && !mobileOpen;

  const links = [
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "Our Story" },
    { href: "/delivery", label: "Delivery" },
    { href: "/contact", label: "Contact" },
  ];

  const linkColor = (active: boolean) =>
    transparent
      ? active ? "white" : "rgba(255,255,255,0.7)"
      : active ? "var(--ink)" : "var(--ink-soft)";

  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          height: 60, padding: "0 clamp(16px, 3vw, 40px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: transparent ? "transparent" : "rgba(250,246,240,0.95)",
          backdropFilter: transparent ? "none" : "blur(20px)",
          borderBottom: scrolled || mobileOpen ? "1px solid rgba(0,0,0,0.04)" : "1px solid transparent",
          transition: "all 0.5s",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          {(transparent ? logos.logo_light : logos.logo_dark) ? (
            <img src={(transparent ? logos.logo_light : logos.logo_dark)!} alt="Nankilly" style={{ height: 32, width: "auto" }} />
          ) : (
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, color: transparent ? "var(--white)" : "var(--ink)", transition: "color 0.4s" }}>
              Nankilly
            </span>
          )}
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} style={{
              fontSize: 14, fontWeight: pathname === l.href ? 500 : 400,
              letterSpacing: "0.08em", textTransform: "uppercase" as const,
              color: linkColor(pathname === l.href), transition: "color 0.3s",
            }}>
              {l.label}
            </Link>
          ))}
          <button onClick={() => setCartOpen(true)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
            fontSize: 14, fontWeight: 400, letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: transparent ? "rgba(255,255,255,0.7)" : "var(--ink-soft)",
          }}>
            Bag
            {count > 0 && (
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--blush)", color: "white", fontSize: 9, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: bag + burger */}
        <div className="nav-burger" style={{ alignItems: "center", gap: 16 }}>
          <button onClick={() => setCartOpen(true)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" as const,
            color: transparent ? "rgba(255,255,255,0.7)" : "var(--ink-soft)",
          }}>
            Bag
            {count > 0 && (
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--blush)", color: "white", fontSize: 9, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {count}
              </span>
            )}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            display: "flex", flexDirection: "column", gap: 5, width: 28,
          }}>
            <span style={{ display: "block", height: 2, width: mobileOpen ? 20 : 20, background: transparent ? "white" : "var(--ink)", transition: "all 0.3s", transform: mobileOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
            <span style={{ display: "block", height: 2, width: 20, background: transparent ? "white" : "var(--ink)", transition: "all 0.3s", opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ display: "block", height: 2, width: mobileOpen ? 20 : 14, background: transparent ? "white" : "var(--ink)", transition: "all 0.3s", transform: mobileOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className="nav-mobile" data-open={mobileOpen ? "true" : "false"} style={{
        position: "fixed", top: 60, left: 0, right: 0, bottom: 0, zIndex: 99,
        background: "rgba(250,246,240,0.98)", backdropFilter: "blur(20px)",
        flexDirection: "column", padding: "32px clamp(16px, 3vw, 40px)",
      }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} style={{
            display: "block", fontSize: 20, fontFamily: "var(--font-serif)",
            fontWeight: pathname === l.href ? 500 : 400,
            color: pathname === l.href ? "var(--ocean)" : "var(--ink)",
            padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.04)",
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
