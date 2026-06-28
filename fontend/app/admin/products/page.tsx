"use client";

import { useState } from "react";
import Link from "next/link";

const PRODUCTS = [
  { id: "P001", name: "Monstera Deliciosa", category: "Indoor Plants", price: "₹849", stock: 142, status: "Active",   img: "🪴" },
  { id: "P002", name: "Snake Plant",         category: "Indoor Plants", price: "₹549", stock: 98,  status: "Active",   img: "🌿" },
  { id: "P003", name: "Peace Lily",          category: "Flower Plants", price: "₹729", stock: 54,  status: "Active",   img: "🌸" },
  { id: "P004", name: "Succulent Set ×3",    category: "Succulents",    price: "₹599", stock: 0,   status: "Out of Stock", img: "🌵" },
  { id: "P005", name: "Fiddle Leaf Fig",     category: "Indoor Plants", price: "₹1,299", stock: 22, status: "Active",  img: "🌳" },
  { id: "P006", name: "Orchid Collection",   category: "Flower Plants", price: "₹1,899", stock: 37, status: "Active",  img: "🌺" },
  { id: "P007", name: "AI Care Soil Tester", category: "Tools",         price: "₹2,199", stock: 61, status: "Active",  img: "🔬" },
  { id: "P008", name: "Premium Potting Mix", category: "Soil & Compost",price: "₹349", stock: 210, status: "Active",   img: "🪣" },
  { id: "P009", name: "Wildflower Seeds Mix",category: "Seeds",         price: "₹199", stock: 0,   status: "Draft",    img: "🌱" },
  { id: "P010", name: "Bamboo Stakes Set",   category: "Tools",         price: "₹149", stock: 88,  status: "Active",   img: "🎋" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "Active":       { bg: "#d4edda", color: "#1a5c2d" },
  "Out of Stock": { bg: "#f8d7da", color: "#721c24" },
  "Draft":        { bg: "#e2e3e5", color: "#383d41" },
};

const CATEGORIES = ["All", ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2D3A2E", margin: 0 }}>Products</h1>
          <p style={{ fontSize: "14px", color: "#6B7C6D", margin: "4px 0 0" }}>{PRODUCTS.length} total products</p>
        </div>
        <button style={{
          background: "linear-gradient(135deg,#2D5A27,#4A7C40)", color: "#fff",
          border: "none", padding: "11px 22px", borderRadius: "50px", fontFamily: "'Poppins',sans-serif",
          fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          boxShadow: "0 4px 16px rgba(45,90,39,0.25)",
        }}>
          <span>+</span> Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", border: "1px solid #edf2ed", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{ flex: "1 1 200px", padding: "9px 14px", borderRadius: "10px", border: "1.5px solid #e0e8e0", fontSize: "14px", fontFamily: "'Poppins',sans-serif", outline: "none", color: "#2D3A2E" }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: "10px", border: "1.5px solid #e0e8e0", fontSize: "14px", fontFamily: "'Poppins',sans-serif", color: "#2D3A2E", background: "#fff", cursor: "pointer", outline: "none" }}
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #edf2ed", boxShadow: "0 2px 16px rgba(45,90,39,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fbf8" }}>
                {["Product", "ID", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontWeight: 600, color: "#6B7C6D", fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderTop: "1px solid #f0f4f0", background: i % 2 === 0 ? "#fff" : "#fafcfa", transition: "background 0.15s" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0f7ef", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{p.img}</div>
                      <span style={{ fontWeight: 600, color: "#2D3A2E", whiteSpace: "nowrap" }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#6B7C6D", whiteSpace: "nowrap" }}>{p.id}</td>
                  <td style={{ padding: "14px 16px", color: "#4A7C40", whiteSpace: "nowrap" }}>{p.category}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "#2D3A2E", whiteSpace: "nowrap" }}>{p.price}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: p.stock === 0 ? "#c0392b" : "#2D3A2E", whiteSpace: "nowrap" }}>{p.stock === 0 ? "—" : p.stock}</td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ ...STATUS_STYLE[p.status], padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: 600 }}>{p.status}</span>
                  </td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ padding: "5px 12px", borderRadius: "8px", border: "1.5px solid #4A7C40", color: "#4A7C40", background: "transparent", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Edit</button>
                      <button style={{ padding: "5px 12px", borderRadius: "8px", border: "1.5px solid #e74c3c", color: "#e74c3c", background: "transparent", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#6B7C6D", fontSize: "14px" }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
