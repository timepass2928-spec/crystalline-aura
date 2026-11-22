import React, { useState } from "react";
import { LogoMark } from "@/components/Logo";

const COLLECTIONS = [
  {
    id: 1,
    name: "Ethereal Solitaire Ring",
    category: "Rings",
    price: "$2,450",
    stone: "1.2ct Oval Lab-Grown Diamond • 18k Champagne Gold",
  },
  {
    id: 2,
    name: "Celestial Halo Pendant",
    category: "Necklaces",
    price: "$1,680",
    stone: "0.85ct Pear Diamond • Recycled Platinum",
  },
  {
    id: 3,
    name: "Aurora Drop Earrings",
    category: "Earrings",
    price: "$1,920",
    stone: "1.4ct Matched Marquise Pair • 18k Rose Gold",
  },
  {
    id: 4,
    name: "Prism Tennis Bracelet",
    category: "Bracelets",
    price: "$3,800",
    stone: "4.0ct Emerald-Cut Diamonds • 18k White Gold",
  },
];

export default function App() {
  const [selected, setSelected] = useState(null);
  const [bagCount, setBagCount] = useState(0);
  const [inquirySent, setInquirySent] = useState(false);

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#FAF8F5", color: "#1C1917", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 8%", borderBottom: "1px solid #E7E2DA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <LogoMark className="w-8 h-8" />
          <span style={{ letterSpacing: "0.22em", fontSize: "15px", textTransform: "uppercase" }}>Crystalline Aura</span>
        </div>
        <nav style={{ display: "flex", gap: "28px", fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <a href="#collections" style={{ color: "inherit", textDecoration: "none" }}>Collections</a>
          <a href="#atelier" style={{ color: "inherit", textDecoration: "none" }}>Atelier</a>
          <a href="#bespoke" style={{ color: "inherit", textDecoration: "none" }}>Bespoke</a>
          <span>Bag ({bagCount})</span>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "96px 8% 80px", maxWidth: "820px", margin: "0 auto" }}>
        <p style={{ fontSize: "12px", letterSpacing: "0.28em", textTransform: "uppercase", color: "#8C7A6B", marginBottom: "16px" }}>
          Fine Ethical Jewelry • Handcrafted to Order
        </p>
        <h1 style={{ fontSize: "48px", fontWeight: "normal", lineHeight: 1.18, marginBottom: "24px" }}>
          Light Captured in Architectural Form
        </h1>
        <p style={{ fontSize: "17px", lineHeight: 1.7, color: "#57534E", marginBottom: "36px" }}>
          Crystalline Aura crafts luminous heirloom pieces using certified conflict-free diamonds and recycled 18k precious metals.
        </p>
        <a
          href="#collections"
          style={{ display: "inline-block", padding: "14px 36px", background: "#1C1917", color: "#FAF8F5", textDecoration: "none", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          Explore the Collection
        </a>
      </section>

      {/* Collections Grid */}
      <section id="collections" style={{ padding: "64px 8%", background: "#F3EFEA" }}>
        <h2 style={{ textAlign: "center", fontWeight: "normal", fontSize: "30px", marginBottom: "44px" }}>Signature Pieces</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "28px" }}>
          {COLLECTIONS.map((item) => (
            <div key={item.id} style={{ background: "#FAF8F5", padding: "28px", border: "1px solid #E7E2DA" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8C7A6B" }}>{item.category}</p>
              <h3 style={{ fontSize: "20px", fontWeight: "normal", margin: "10px 0" }}>{item.name}</h3>
              <p style={{ fontSize: "14px", color: "#57534E", lineHeight: 1.6, minHeight: "44px" }}>{item.stone}</p>
              <p style={{ fontSize: "16px", margin: "16px 0" }}>{item.price}</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setBagCount((c) => c + 1)}
                  style={{ flex: 1, padding: "10px", background: "#1C1917", color: "#FAF8F5", border: "none", cursor: "pointer", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}
                >
                  Add to Bag
                </button>
                <button
                  onClick={() => setSelected(item)}
                  style={{ padding: "10px 14px", background: "transparent", border: "1px solid #1C1917", cursor: "pointer", fontSize: "11px" }}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
        {selected && (
          <div style={{ marginTop: "28px", padding: "20px", background: "#FAF8F5", border: "1px solid #1C1917", textAlign: "center" }}>
            <strong>{selected.name}</strong> — {selected.stone} ({selected.price}) •{" "}
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>
              Close
            </button>
          </div>
        )}
      </section>

      {/* Atelier & Bespoke */}
      <section id="atelier" style={{ padding: "72px 8%", maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontWeight: "normal", fontSize: "28px", marginBottom: "16px" }}>The Crystalline Atelier</h2>
        <p style={{ color: "#57534E", lineHeight: 1.8 }}>
          Every facet is individually proportioned to maximize brilliance in natural daylight. Custom engravings and bespoke stone sourcing are available upon private consultation.
        </p>
      </section>

      <section id="bespoke" style={{ padding: "64px 8%", background: "#1C1917", color: "#FAF8F5", textAlign: "center" }}>
        <h2 style={{ fontWeight: "normal", fontSize: "28px", marginBottom: "12px" }}>Private Bespoke Consultation</h2>
        <p style={{ color: "#D6D3D1", marginBottom: "24px" }}>Request a custom design sketch or virtual showroom appointment.</p>
        {inquirySent ? (
          <p style={{ color: "#E7D4B5" }}>Thank you. Our concierge will reach out within 24 hours.</p>
        ) : (
          <button
            onClick={() => setInquirySent(true)}
            style={{ padding: "14px 32px", background: "#FAF8F5", color: "#1C1917", border: "none", cursor: "pointer", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase" }}
          >
            Request Private Appointment
          </button>
        )}
      </section>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "32px 8%", fontSize: "12px", color: "#78716C", borderTop: "1px solid #E7E2DA" }}>
        © {new Date().getFullYear()} Crystalline Aura. All rights reserved.
      </footer>
    </div>
  );
}
