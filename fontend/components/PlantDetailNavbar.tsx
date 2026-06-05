"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const T = {
  bg: "#fefcf9",
  text: "#1c1c1c",
  green: "#00b566",
  instant: "200ms",
  fab: "50px",
  s2: "rgb(202, 223, 212) 0px 0px 0px 1px inset",
};

const LeafLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C12 2 4 5 4 13C4 17.4 7.6 21 12 21C16.4 21 20 17.4 20 13C20 5 12 2 12 2Z" fill={T.green} />
    <path d="M12 21V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 15L8 11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M12 12L16 8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const CartIco = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

interface PlantDetailNavbarProps {
  cartCount?: number;
}

export default function PlantDetailNavbar({ cartCount = 1 }: PlantDetailNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = ["Home", "Plants", "Products", "About"];

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: T.bg, boxShadow: scrolled ? T.s2 : "none", transition: `box-shadow ${T.instant}`, fontFamily: "Outfit, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="nav-inner">
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <LeafLogo />
          <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 500, fontSize: "16px", color: T.text }}>plant byst</span>
        </Link>

        {/* Links desktop */}
        <nav aria-label="Main navigation" className="nav-links">
          <div style={{ display: "flex", gap: "28px" }}>
            {navLinks.map((l) => (
              <Link key={l} href={l === "Home" ? "/" : "#"}
                style={{ fontFamily: "Outfit, sans-serif", fontWeight: 400, fontSize: "13.33px", color: l === "Plants" ? T.green : T.text, textDecoration: "none", transition: `color ${T.instant}`, borderBottom: l === "Plants" ? `2px solid ${T.green}` : "2px solid transparent", paddingBottom: "2px" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = T.green; (e.currentTarget as HTMLAnchorElement).style.color = T.green; }}
                onMouseLeave={(e) => { if (l !== "Plants") { (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = T.text; } }}
              >{l}</Link>
            ))}
          </div>
        </nav>

        {/* Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[
            { label: "Search", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
            { label: "Account", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
          ].map(({ label, icon }) => (
            <button key={label} aria-label={label} style={{ width: "40px", height: "40px", borderRadius: T.fab, border: "none", background: "transparent", cursor: "pointer", color: T.text, display: "flex", alignItems: "center", justifyContent: "center", transition: `background ${T.instant}` }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = `${T.green}18`)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
            >{icon}</button>
          ))}
          <button aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
            style={{ position: "relative", width: "40px", height: "40px", borderRadius: T.fab, border: "none", background: "transparent", cursor: "pointer", color: T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CartIco />
            <span style={{ position: "absolute", top: "4px", right: "4px", background: T.green, color: "white", fontSize: "9px", fontWeight: 700, width: "15px", height: "15px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
          </button>
          {/* Hamburger */}
          <button aria-label="Open menu" className="hamburger" onClick={() => setOpen(!open)}
            style={{ display: "none", width: "40px", height: "40px", borderRadius: T.fab, border: "none", background: "transparent", cursor: "pointer", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            {[0,1,2].map(i => <span key={i} style={{ display: "block", width: "18px", height: "2px", background: T.text, borderRadius: "2px" }} />)}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ background: T.bg, padding: "12px 24px 20px", borderTop: `1px solid rgba(28,28,28,0.08)` }}>
          {navLinks.map(l => (
            <Link key={l} href={l === "Home" ? "/" : "#"} onClick={() => setOpen(false)}
              style={{ display: "block", padding: "12px 0", fontFamily: "Outfit, sans-serif", fontSize: "15px", color: l === "Plants" ? T.green : T.text, textDecoration: "none", borderBottom: "1px solid rgba(28,28,28,0.06)" }}
            >{l}</Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-inner { padding: 0 16px !important; }
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
