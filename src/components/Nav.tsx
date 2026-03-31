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
  const pathname = usePathname();
  const count = useCart((s) => s.count());
  const isHome = pathname === "/";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // On homepage hero, nav is transparent
  const transparent = isHome && !scrolled;

  const links = [
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "Our Story" },
    { href: "/delivery", label: "Delivery" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 60,
          padding: "0 clamp(16px, 3vw, 40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: transparent ? "transparent" : "rgba(250,246,240,0.95)",
          backdropFilter: transparent ? "none" : "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.04)" : "1px solid transparent",
          transition: "all 0.5s",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 22,
            fontWeight: 500,
            color: transparent ? "var(--white)" : "var(--ink)",
            transition: "color 0.4s",
          }}
        >
          Nankilly
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 11,
                fontWeight: pathname === l.href ? 500 : 400,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                color: transparent
                  ? pathname === l.href
                    ? "white"
                    : "rgba(255,255,255,0.7)"
                  : pathname === l.href
                  ? "var(--ink)"
                  : "var(--ink-soft)",
                transition: "color 0.3s",
              }}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => setCartOpen(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: transparent ? "rgba(255,255,255,0.7)" : "var(--ink-soft)",
            }}
          >
            Bag
            {count > 0 && (
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "var(--blush)",
                  color: "white",
                  fontSize: 9,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
