"use client";

import { useState } from "react";

const CUSTOMERS = [
  { id: "C001", name: "Priya Sharma",    email: "priya@email.com",  phone: "+91 98765 43210", orders: 12, spent: "₹8,420",  joined: "Jan 2025", status: "Active"   },
  { id: "C002", name: "Rahul Mehta",     email: "rahul@email.com",  phone: "+91 87654 32109", orders: 8,  spent: "₹5,680",  joined: "Mar 2025", status: "Active"   },
  { id: "C003", name: "Neha Kapoor",     email: "neha@email.com",   phone: "+91 76543 21098", orders: 5,  spent: "₹3,200",  joined: "May 2025", status: "Active"   },
  { id: "C004", name: "Aditya Patel",    email: "aditya@email.com", phone: "+91 65432 10987", orders: 3,  spent: "₹1,890",  joined: "Jun 2025", status: "Active"   },
  { id: "C005", name: "Sunita Rao",      email: "sunita@email.com", phone: "+91 54321 09876", orders: 1,  spent: "₹1,899",  joined: "Jun 2026", status: "Active"   },
  { id: "C006", name: "Vikram Das",      email: "vikram@email.com", phone: "+91 43210 98765", orders: 7,  spent: "₹4,120",  joined: "Feb 2025", status: "Active"   },
  { id: "C007", name: "Asha Tiwari",     email: "asha@email.com",   phone: "+91 32109 87654", orders: 2,  spent: "₹699",    joined: "Apr 2026", status: "Inactive" },
  { id: "C008", name: "Kiran Bose",      email: "kiran@email.com",  phone: "+91 21098 76543", orders: 4,  spent: "₹2,940",  joined: "Nov 2024", status: "Active"   },
  { id: "C009", name: "Meena Gupta",     email: "meena@email.com",  phone: "+91 10987 65432", orders: 9,  spent: "₹6,750",  joined: "Dec 2024", status: "Active"   },
  { id: "C010", name: "Arjun Singh",     email: "arjun@email.com",  phone: "+91 09876 54321", orders: 0,  spent: "₹0",      joined: "Jun 2026", status: "Inactive" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Active:   { bg: "#d4edda", color: "#1a5c2d" },
  Inactive: { bg: "#e2e3e5", color: "#383d41" },
};

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = CUSTOMERS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalActive   = CUSTOMERS.filter(c => c.status === "Active").length;
  const totalInactive = CUSTOMERS.filter(c => c.status === "Inactive").length;
  const totalSpent    = "₹35,598";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2D3A2E", margin: 0 }}>Customers</h1>
        <p style={{ fontSize: "14px", color: "#6B7C6D", margin: "4px 0 0" }}>{CUSTOMERS.length} registered customers</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {[
          { label: "Total Customers", value: CUSTOMERS.length, icon: "👥", bg: "#e2d9f3", iconColor: "#6f42c1" },
          { label: "Active",          value: totalActive,       icon: "✅", bg: "#d4edda", iconColor: "#2D5A27" },
          { label: "Inactive",        value: totalInactive,     icon: "⏸️", bg: "#e2e3e5", iconColor: "#383d41" },
          { label: "Total Spent",     value: totalSpent,        icon: "💰", bg: "#fff3cd", iconColor: "#856404" },
        ].map(s => (
          <div key={s.label} style={{ flex: "1 1 160px", background: "#fff", borderRadius: "14px", padding: "18px 20px", border: "1px solid #edf2ed", boxShadow: "0 2px 10px rgba(45,90,39,0.06)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "12px", color: "#6B7C6D", fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#2D3A2E" }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", border: "1px solid #edf2ed", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or ID..."
          style={{ flex: "1 1 220px", padding: "9px 14px", borderRadius: "10px", border: "1.5px solid #e0e8e0", fontSize: "14px", fontFamily: "'Poppins',sans-serif", outline: "none", color: "#2D3A2E" }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: "10px", border: "1.5px solid #e0e8e0", fontSize: "14px", fontFamily: "'Poppins',sans-serif", color: "#2D3A2E", background: "#fff", cursor: "pointer", outline: "none" }}
        >
          {["All", "Active", "Inactive"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #edf2ed", boxShadow: "0 2px 16px rgba(45,90,39,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fbf8" }}>
                {["Customer", "ID", "Email", "Phone", "Orders", "Total Spent", "Joined", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontWeight: 600, color: "#6B7C6D", fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderTop: "1px solid #f0f4f0", background: i % 2 === 0 ? "#fff" : "#fafcfa" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#2D5A27,#4A7C40)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, color: "#2D3A2E", whiteSpace: "nowrap" }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#6B7C6D", whiteSpace: "nowrap" }}>{c.id}</td>
                  <td style={{ padding: "14px 16px", color: "#4A7C40", whiteSpace: "nowrap" }}>{c.email}</td>
                  <td style={{ padding: "14px 16px", color: "#2D3A2E", whiteSpace: "nowrap" }}>{c.phone}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#2D3A2E", textAlign: "center", whiteSpace: "nowrap" }}>{c.orders}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#2D5A27", whiteSpace: "nowrap" }}>{c.spent}</td>
                  <td style={{ padding: "14px 16px", color: "#6B7C6D", whiteSpace: "nowrap" }}>{c.joined}</td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ ...STATUS_STYLE[c.status], padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: 600 }}>{c.status}</span>
                  </td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ padding: "5px 12px", borderRadius: "8px", border: "1.5px solid #4A7C40", color: "#4A7C40", background: "transparent", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>View</button>
                      <button style={{ padding: "5px 12px", borderRadius: "8px", border: "1.5px solid #e74c3c", color: "#e74c3c", background: "transparent", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Block</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#6B7C6D", fontSize: "14px" }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
