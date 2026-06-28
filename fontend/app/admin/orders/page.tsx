"use client";

import { useState } from "react";

const ORDERS = [
  { id: "ORD-1042", customer: "Priya S.",   email: "priya@email.com",  product: "Monstera Deliciosa",  amount: "₹849",   status: "Delivered",  date: "27 Jun 2026", items: 1 },
  { id: "ORD-1041", customer: "Rahul M.",   email: "rahul@email.com",  product: "Snake Plant Pack",    amount: "₹1,249", status: "Shipped",    date: "27 Jun 2026", items: 2 },
  { id: "ORD-1040", customer: "Neha K.",    email: "neha@email.com",   product: "AI Care Soil Tester", amount: "₹2,199", status: "Processing", date: "26 Jun 2026", items: 1 },
  { id: "ORD-1039", customer: "Aditya P.",  email: "aditya@email.com", product: "Succulent Set ×3",   amount: "₹599",   status: "Delivered",  date: "26 Jun 2026", items: 3 },
  { id: "ORD-1038", customer: "Sunita R.",  email: "sunita@email.com", product: "Orchid Collection",  amount: "₹1,899", status: "Cancelled",  date: "25 Jun 2026", items: 1 },
  { id: "ORD-1037", customer: "Vikram D.",  email: "vikram@email.com", product: "Peace Lily",         amount: "₹729",   status: "Delivered",  date: "25 Jun 2026", items: 1 },
  { id: "ORD-1036", customer: "Asha T.",    email: "asha@email.com",   product: "Premium Potting Mix", amount: "₹349",  status: "Shipped",    date: "24 Jun 2026", items: 1 },
  { id: "ORD-1035", customer: "Kiran B.",   email: "kiran@email.com",  product: "Fiddle Leaf Fig",    amount: "₹1,299", status: "Processing", date: "24 Jun 2026", items: 1 },
  { id: "ORD-1034", customer: "Meena G.",   email: "meena@email.com",  product: "Bamboo Stakes Set",  amount: "₹149",   status: "Delivered",  date: "23 Jun 2026", items: 2 },
  { id: "ORD-1033", customer: "Arjun S.",   email: "arjun@email.com",  product: "Wildflower Seeds",   amount: "₹199",   status: "Cancelled",  date: "23 Jun 2026", items: 1 },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Delivered:  { bg: "#d4edda", color: "#1a5c2d" },
  Shipped:    { bg: "#cce5ff", color: "#004085" },
  Processing: { bg: "#fff3cd", color: "#856404" },
  Cancelled:  { bg: "#f8d7da", color: "#721c24" },
};

const ALL_STATUSES = ["All", "Delivered", "Shipped", "Processing", "Cancelled"];

export default function AdminOrdersPage() {
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("All");

  const filtered = ORDERS.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All" || o.status === status;
    return matchSearch && matchStatus;
  });

  // Summary counts
  const counts = ALL_STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = ORDERS.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2D3A2E", margin: 0 }}>Orders</h1>
        <p style={{ fontSize: "14px", color: "#6B7C6D", margin: "4px 0 0" }}>{ORDERS.length} total orders</p>
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {[
          { label: "Delivered",  count: counts["Delivered"],  bg: "#d4edda", color: "#1a5c2d" },
          { label: "Shipped",    count: counts["Shipped"],    bg: "#cce5ff", color: "#004085" },
          { label: "Processing", count: counts["Processing"], bg: "#fff3cd", color: "#856404" },
          { label: "Cancelled",  count: counts["Cancelled"],  bg: "#f8d7da", color: "#721c24" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "12px", padding: "14px 20px", border: "1px solid #edf2ed", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 8px rgba(45,90,39,0.05)" }}>
            <span style={{ ...s, padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#2D3A2E" }}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", border: "1px solid #edf2ed", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID or customer..."
          style={{ flex: "1 1 220px", padding: "9px 14px", borderRadius: "10px", border: "1.5px solid #e0e8e0", fontSize: "14px", fontFamily: "'Poppins',sans-serif", outline: "none", color: "#2D3A2E" }}
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: "10px", border: "1.5px solid #e0e8e0", fontSize: "14px", fontFamily: "'Poppins',sans-serif", color: "#2D3A2E", background: "#fff", cursor: "pointer", outline: "none" }}
        >
          {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #edf2ed", boxShadow: "0 2px 16px rgba(45,90,39,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fbf8" }}>
                {["Order ID", "Customer", "Product", "Items", "Amount", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontWeight: 600, color: "#6B7C6D", fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} style={{ borderTop: "1px solid #f0f4f0", background: i % 2 === 0 ? "#fff" : "#fafcfa" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#2D5A27", whiteSpace: "nowrap" }}>{o.id}</td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 600, color: "#2D3A2E" }}>{o.customer}</div>
                    <div style={{ fontSize: "11px", color: "#6B7C6D" }}>{o.email}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#4A7C40", whiteSpace: "nowrap" }}>{o.product}</td>
                  <td style={{ padding: "14px 16px", color: "#2D3A2E", textAlign: "center", whiteSpace: "nowrap" }}>{o.items}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#2D3A2E", whiteSpace: "nowrap" }}>{o.amount}</td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ ...STATUS_STYLE[o.status], padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: 600 }}>{o.status}</span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#6B7C6D", whiteSpace: "nowrap" }}>{o.date}</td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ padding: "5px 12px", borderRadius: "8px", border: "1.5px solid #4A7C40", color: "#4A7C40", background: "transparent", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>View</button>
                      <button style={{ padding: "5px 12px", borderRadius: "8px", border: "1.5px solid #6B7C6D", color: "#6B7C6D", background: "transparent", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Update</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#6B7C6D", fontSize: "14px" }}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
