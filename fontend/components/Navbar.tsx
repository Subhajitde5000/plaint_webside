"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function LeafIcon({ size = 24, color = "#2D5A27" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 4 5 4 13C4 17.4 7.6 21 12 21C16.4 21 20 17.4 20 13C20 5 12 2 12 2Z" fill={color} opacity="0.9" />
      <path d="M12 21V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 15L8 11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 12L16 8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

interface NavbarProps {
  cartCount?: number;
}

export default function Navbar({ cartCount = 3 }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [plantsOpen, setPlantsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchOpen]);

  // sync local cart count with storage and events
  const [localCartCount, setLocalCartCount] = useState<number>(() => {
    try {
      const v = typeof window !== "undefined" ? window.localStorage.getItem("cartCount") : null;
      const n = v ? Number(v) : NaN;
      return Number.isFinite(n) ? n : cartCount;
    } catch (e) {
      return cartCount;
    }
  });

  useEffect(() => {
    const onCart = (e: any) => {
      const newCount = typeof e?.detail === "number" ? e.detail : (typeof window !== "undefined" ? Number(window.localStorage.getItem("cartCount") || 0) : localCartCount);
      setLocalCartCount(Number.isFinite(newCount) ? newCount : 0);
    };
    window.addEventListener("cart:changed", onCart as EventListener);
    return () => window.removeEventListener("cart:changed", onCart as EventListener);
  }, [localCartCount]);

  return (
    <nav
      id="navbar"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: "white",
        boxShadow: scrolled ? "0 2px 20px rgba(45,90,39,0.10)" : "none",
        borderBottom: scrolled ? "none" : "1px solid rgba(168,197,160,0.2)",
        transition: "box-shadow 0.3s ease",
        height: "68px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        {/* Logo */}
        <a href="/" id="logo-link" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <LeafIcon size={28} />
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "22px", color: "var(--color-green-dark)" }}>Hero</span>
        </a>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "36px" }} className="desktop-nav">
          <div style={{ position: "relative" }}>
            <button
              id="nav-plants"
              aria-expanded={plantsOpen}
              aria-controls="plants-menu"
              onClick={() => setPlantsOpen((prev) => !prev)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "4px", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-green-mid)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
            >
              Plants <ChevronDown />
            </button>

            {plantsOpen && (
              <div
                id="plants-menu"
                style={{ position: "absolute", top: "32px", left: 0, minWidth: "200px", background: "white", borderRadius: "12px", boxShadow: "0 12px 28px rgba(0,0,0,0.12)", padding: "10px", display: "flex", flexDirection: "column", gap: "6px", zIndex: 120 }}
              >
                {["Indoor Plants", "Flower Plants", "Succulents", "Balcony Decor"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    style={{ fontFamily: "DM Sans", fontSize: "14px", color: "var(--color-text-primary)", padding: "8px 10px", borderRadius: "8px", transition: "background 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => setPlantsOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <a
              href="#"
              id="nav-products"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "4px", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-green-mid)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
            >
              Products
            </a>

            {productsOpen && (
              <div
                id="products-menu"
                style={{ position: "absolute", top: "32px", left: 0, background: "white", borderRadius: "12px", boxShadow: "0 12px 28px rgba(0,0,0,0.12)", padding: "10px 12px", display: "flex", alignItems: "center", gap: "12px", zIndex: 120, whiteSpace: "nowrap" }}
              >
                {["All Products", "Seeds", "Soil", "Tools", "Fertilizer"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    style={{ fontFamily: "DM Sans", fontSize: "14px", color: "var(--color-text-primary)", padding: "6px 10px", borderRadius: "999px", transition: "background 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>

          {["Supplies", "AI Care"].map((label) => (
            <a key={label} href="#" id={`nav-${label.toLowerCase().replace(" ", "-")}`}
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: "15px", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "4px", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-green-mid)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="nav-search-wrap" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              className="nav-search-field"
              style={{
                width: searchOpen ? "220px" : "0px",
                opacity: searchOpen ? 1 : 0,
                overflow: "hidden",
                pointerEvents: searchOpen ? "auto" : "none",
                transition: "width 0.2s ease, opacity 0.2s ease",
              }}
            >
              <div style={{ background: "white", border: "1px solid var(--color-green-light)", borderRadius: "999px", padding: "6px 12px", boxShadow: "0 8px 20px rgba(45,90,39,0.12)", boxSizing: "border-box" }}>
                <input
                  id="nav-search-input"
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search plants, seeds, supplies"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") setSearchOpen(false); }}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "DM Sans, sans-serif", fontSize: "14px", color: "var(--color-text-primary)" }}
                />
              </div>
            </div>

            <button
              id="search-btn"
              aria-expanded={searchOpen}
              aria-controls="nav-search-input"
              onClick={() => setSearchOpen((prev) => !prev)}
              style={{ background: "var(--color-bg-secondary)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-green-dark)", transition: "background 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-green-pale)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-bg-secondary)")}
            >
              <SearchIcon />
            </button>
          </div>

          <button id="cart-btn" style={{ background: "none", border: "none", cursor: "pointer", position: "relative", color: "var(--color-green-dark)", padding: "4px" }}>
            <CartIcon />
            <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#E53E3E", color: "white", fontSize: "11px", fontWeight: 700, width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins, sans-serif" }}>{localCartCount}</span>
          </button>

          <button
            id="user-btn"
            aria-label="Account"
            style={{ background: "var(--color-bg-secondary)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-green-dark)", fontSize: "18px", transition: "background 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-green-pale)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-bg-secondary)")}
          >
            👤
          </button>

          <button id="hamburger-btn" className="hamburger" onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: "5px", padding: "4px" }}
          >
            {[0, 1, 2].map((i) => (<span key={i} style={{ display: "block", width: "22px", height: "2px", background: "var(--color-green-dark)", borderRadius: "2px" }} />))}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ position: "absolute", top: "68px", left: 0, right: 0, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", padding: "16px 24px", display: "flex", flexDirection: "column", gap: "16px", animation: "fadeSlideUp 0.2s ease" }}>
          {["Plants", "Products", "Supplies", "AI Care"].map((item) => (
            <a key={item} href="#" style={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "16px", color: "var(--color-text-primary)", padding: "8px 0", borderBottom: "1px solid var(--color-bg-secondary)" }}>{item}</a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
