"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MOCK_DISCOUNTS,
  KPI_DATA,
  Discount,
  DiscountStatus,
  DiscountType,
  DiscountMethod,
  countByStatus,
} from "./data";

/* ─── Design Tokens ─────────────────────────────────────────────────────────── */
const T = {
  bg: "#0f1117",
  card: "#1c2128",
  elevated: "#22272e",
  overlay: "#2d333b",
  text: "#cdd9e5",
  muted: "#768390",
  label: "#adbac7",
  placeholder: "#545d68",
  border: "#444c56",
  borderMuted: "rgba(68,76,86,0.5)",
  borderActive: "#00b566",
  accent: "#00b566",
  accentBg: "rgba(0,181,102,0.12)",
  success: "#57ab5a",
  successBg: "rgba(87,171,90,0.15)",
  warning: "#c69026",
  warningBg: "rgba(198,144,38,0.15)",
  error: "#e5534b",
  errorBg: "rgba(229,83,75,0.15)",
  info: "#539bf5",
  infoBg: "rgba(83,159,245,0.15)",
  purple: "#986ee2",
  purpleBg: "rgba(152,110,226,0.15)",
  shadow: "0 2px 8px rgba(0,0,0,0.35)",
  focus: "0 0 0 3px rgba(0,181,102,0.25)",
};

/* ─── Icon Library ───────────────────────────────────────────────────────────── */
const Icon = {
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Filter: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  ChevronUp: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  ),
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  ),
  MoreVert: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
  BarChart: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><path d="M2 20h20" />
    </svg>
  ),
  Ticket: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  SortArrow: ({ asc }: { asc?: boolean }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {asc
        ? <><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></>
        : <><path d="m19 12-7 7-7-7" /><path d="M12 5v14" /></>}
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
};

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function discountValueLabel(d: Discount): string {
  if (d.type === "percentage") return `${d.value}%`;
  if (d.type === "fixed") return `₹${d.value}`;
  if (d.type === "shipping") return "Free";
  return "BOGO";
}

function typeConfig(type: DiscountType) {
  if (type === "percentage") return { icon: "%", label: "% off",          bg: T.accentBg,  color: T.accent };
  if (type === "fixed")      return { icon: "₹", label: "₹ off",          bg: T.accentBg,  color: T.accent };
  if (type === "shipping")   return { icon: "🚚", label: "Free Shipping",  bg: T.infoBg,    color: T.info };
  return                            { icon: "🎁", label: "Buy X Get Y",    bg: T.purpleBg,  color: T.purple };
}

function statusConfig(status: DiscountStatus) {
  if (status === "active")    return { label: "Active",    color: T.success, bg: T.successBg };
  if (status === "scheduled") return { label: "Scheduled", color: T.warning, bg: T.warningBg };
  if (status === "expired")   return { label: "Expired",   color: T.error,   bg: T.errorBg };
  return                             { label: "Draft",     color: T.info,    bg: T.infoBg };
}

type StatusTab = "all" | DiscountStatus;
type SortKey = "newest" | "oldest" | "most_used" | "highest_value" | "expiring_soonest" | "az";

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "active",    label: "Active" },
  { key: "scheduled", label: "Scheduled" },
  { key: "expired",   label: "Expired" },
  { key: "draft",     label: "Draft" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest",          label: "Newest First" },
  { key: "oldest",          label: "Oldest First" },
  { key: "most_used",       label: "Most Used" },
  { key: "highest_value",   label: "Highest Value" },
  { key: "expiring_soonest",label: "Expiring Soonest" },
  { key: "az",              label: "A–Z" },
];

const PAGE_SIZE = 10;

/* ─── Sub-components ─────────────────────────────────────────────────────────── */

function Badge({
  label, color, bg,
}: { label: string; color: string; bg: string }) {
  return (
    <span
      aria-label={`Status: ${label}`}
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "2px 8px", borderRadius: 9999,
        background: bg, color,
        fontSize: 11, fontWeight: 700, letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function TypeBadge({ type }: { type: DiscountType }) {
  const cfg = typeConfig(type);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 9999,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700,
    }}>
      <span>{cfg.icon}</span> {cfg.label}
    </span>
  );
}

function MethodBadge({ method }: { method: DiscountMethod }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 9999,
      background: method === "automatic" ? T.purpleBg : T.elevated,
      color: method === "automatic" ? T.purple : T.label,
      fontSize: 11, fontWeight: 700,
    }}>
      {method === "automatic" ? "Automatic" : "Code"}
    </span>
  );
}

interface OverflowMenuProps {
  discount: Discount;
  onDuplicate: (d: Discount) => void;
  onDelete: (d: Discount) => void;
  onDeactivate: (d: Discount) => void;
}
function OverflowMenu({ discount, onDuplicate, onDelete, onDeactivate }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [
    { label: "Edit", icon: <Icon.Edit />, action: () => router.push(`/admin/discounts/${discount.id}`) },
    { label: "Duplicate", icon: <Icon.Copy />, action: () => { setOpen(false); onDuplicate(discount); } },
    { label: "Copy Discount Link", icon: <Icon.Copy />, action: () => { navigator.clipboard.writeText(`https://yourstore.com/checkout?discount=${discount.code}`); setOpen(false); } },
    { label: "View Usage Report", icon: <Icon.BarChart />, action: () => router.push(`/admin/discounts/${discount.id}?tab=report`) },
    null, // separator
    ...(discount.status === "active" ? [{ label: "Deactivate", icon: <Icon.X />, action: () => { setOpen(false); onDeactivate(discount); }, danger: true }] : []),
    { label: "Delete", icon: <Icon.Trash />, action: () => { setOpen(false); onDelete(discount); }, danger: true },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, borderRadius: 6,
          background: open ? T.elevated : "transparent",
          border: `1px solid ${open ? T.border : "transparent"}`,
          color: T.muted, cursor: "pointer",
          transition: "all 150ms",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.elevated; (e.currentTarget as HTMLElement).style.borderColor = T.border; }}
        onMouseLeave={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; } }}
      >
        <Icon.MoreVert />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", right: 0, top: "calc(100% + 4px)",
            background: T.overlay, border: `1px solid ${T.border}`,
            borderRadius: 8, width: 200, zIndex: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          {items.map((item, i) =>
            item === null ? (
              <div key={`sep-${i}`} style={{ height: 1, background: T.border, margin: "4px 0" }} />
            ) : (
              <button
                key={item.label}
                role="menuitem"
                onClick={item.action}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", padding: "8px 12px",
                  background: "transparent", border: "none",
                  color: (item as { danger?: boolean }).danger ? T.error : T.text,
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  transition: "background 150ms",
                  textAlign: "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = T.elevated)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {item.icon} {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Delete Modal ───────────────────────────────────────────────────────────── */
function DeleteModal({ discount, onClose, onConfirm }: {
  discount: Discount;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [typedCode, setTypedCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const matches = typedCode === discount.code;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
        padding: 28, width: 480, boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 id="delete-modal-title" style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>
            Delete &ldquo;{discount.code}&rdquo;?
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", display: "flex" }}><Icon.X /></button>
        </div>

        {discount.usedCount > 0 && (
          <div style={{
            display: "flex", gap: 10, padding: 12, borderRadius: 8,
            background: T.errorBg, border: `1px solid ${T.error}`,
            marginBottom: 16,
          }}>
            <span style={{ color: T.error, flexShrink: 0 }}><Icon.AlertTriangle /></span>
            <p style={{ margin: 0, fontSize: 13, color: T.text, lineHeight: 1.5 }}>
              This discount has been used in <strong>{discount.usedCount} orders</strong>. Deleting it will not affect those orders, but the discount code will no longer work.
            </p>
          </div>
        )}

        <p style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>To confirm, type the discount code:</p>
        <input
          ref={inputRef}
          value={typedCode}
          onChange={e => setTypedCode(e.target.value)}
          placeholder={discount.code}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 6,
            background: T.elevated, border: `1px solid ${T.border}`,
            color: T.text, fontSize: 14, fontFamily: "monospace",
            outline: "none", boxSizing: "border-box",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = T.borderActive)}
          onBlur={e => (e.currentTarget.style.borderColor = T.border)}
        />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px", borderRadius: 6,
              background: "transparent", border: `1px solid ${T.border}`,
              color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!matches}
            style={{
              padding: "9px 18px", borderRadius: 6,
              background: matches ? T.error : T.border,
              border: "none", color: matches ? "#fff" : T.muted,
              fontSize: 13, fontWeight: 600, cursor: matches ? "pointer" : "not-allowed",
              transition: "all 200ms",
            }}
          >
            Delete Discount
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Duplicate Modal ─────────────────────────────────────────────────────────── */
function DuplicateModal({ discount, onClose, onConfirm }: {
  discount: Discount;
  onClose: () => void;
  onConfirm: (newCode: string, resetUsage: boolean, setAsDraft: boolean) => void;
}) {
  const [newCode, setNewCode] = useState(`${discount.code}-COPY`);
  const [resetUsage, setResetUsage] = useState(true);
  const [setAsDraft, setSetAsDraft] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dup-modal-title"
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
        padding: 28, width: 460, boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 id="dup-modal-title" style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>Duplicate Discount</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", display: "flex" }}><Icon.X /></button>
        </div>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 16, marginTop: 4 }}>
          This will create a copy of &ldquo;{discount.code}&rdquo;
        </p>

        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          New Code
        </label>
        <input
          ref={inputRef}
          value={newCode}
          onChange={e => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 6,
            background: T.elevated, border: `1px solid ${T.border}`,
            color: T.accent, fontSize: 14, fontFamily: "monospace", fontWeight: 700,
            outline: "none", boxSizing: "border-box", textTransform: "uppercase",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = T.borderActive)}
          onBlur={e => (e.currentTarget.style.borderColor = T.border)}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {[
            { label: "Reset usage count to 0", val: resetUsage, set: setResetUsage },
            { label: "Set as Draft (don't activate automatically)", val: setAsDraft, set: setSetAsDraft },
          ].map(({ label, val, set }) => (
            <label key={label} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox" checked={val}
                onChange={e => set(e.target.checked)}
                style={{ accentColor: T.accent, width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: T.text }}>{label}</span>
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 6, background: "transparent", border: `1px solid ${T.border}`, color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(newCode, resetUsage, setAsDraft); onClose(); }}
            style={{ padding: "9px 18px", borderRadius: 6, background: T.accent, border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Create Duplicate
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────────────────── */
type ToastType = "success" | "error" | "info";
interface ToastData { id: number; message: string; type: ToastType }

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const colors = {
    success: { bg: T.successBg, border: T.success, text: T.success },
    error:   { bg: T.errorBg,   border: T.error,   text: T.error },
    info:    { bg: T.accentBg,  border: T.accent,  text: T.accent },
  };
  const c = colors[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div style={{
      padding: "12px 16px", borderRadius: 8,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.text, fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      animation: "toastIn 200ms ease-out",
      minWidth: 280, maxWidth: 380,
    }}>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} style={{ background: "none", border: "none", color: c.text, cursor: "pointer", display: "flex", padding: 0 }}>
        <Icon.X />
      </button>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function AdminDiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>(MOCK_DISCOUNTS);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<Discount | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [toastId, setToastId] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Focus search on mount
  useEffect(() => { searchRef.current?.focus(); }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortOpen]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    setToastId(id => {
      const newId = id + 1;
      setToasts(prev => [...prev, { id: newId, message, type }]);
      return newId;
    });
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Filtering + sorting
  const counts = useMemo(() => countByStatus(discounts), [discounts]);

  const filtered = useMemo(() => {
    let list = activeTab === "all" ? discounts : discounts.filter(d => d.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.code.toLowerCase().includes(q) || d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)
      );
    }
    // sort
    const s = [...list];
    if (sortKey === "newest")           s.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortKey === "oldest")      s.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortKey === "most_used")   s.sort((a, b) => b.usedCount - a.usedCount);
    else if (sortKey === "highest_value") s.sort((a, b) => b.value - a.value);
    else if (sortKey === "expiring_soonest") {
      s.sort((a, b) => {
        const ta = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const tb = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        return ta - tb;
      });
    }
    else if (sortKey === "az") s.sort((a, b) => a.code.localeCompare(b.code));
    return s;
  }, [discounts, activeTab, search, sortKey]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [activeTab, search, sortKey]);

  // Selection
  const allPageSelected = pageItems.length > 0 && pageItems.every(d => selectedIds.has(d.id));
  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allPageSelected) pageItems.forEach(d => next.delete(d.id));
      else pageItems.forEach(d => next.add(d.id));
      return next;
    });
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk actions
  const bulkDeactivate = () => {
    setDiscounts(prev => prev.map(d =>
      selectedIds.has(d.id) && d.status === "active" ? { ...d, status: "draft" as DiscountStatus } : d
    ));
    addToast(`${selectedIds.size} discount(s) deactivated.`, "info");
    setSelectedIds(new Set());
  };

  const bulkDelete = () => {
    setDiscounts(prev => prev.filter(d => !selectedIds.has(d.id)));
    addToast(`${selectedIds.size} discount(s) deleted.`, "info");
    setSelectedIds(new Set());
  };

  // Individual actions
  const handleDelete = (d: Discount) => {
    setDiscounts(prev => prev.filter(x => x.id !== d.id));
    addToast(`"${d.code}" was deleted.`, "info");
    setDeleteTarget(null);
  };

  const handleDuplicate = (d: Discount, newCode: string, resetUsage: boolean, setAsDraft: boolean) => {
    const newId = `dsc-${Date.now()}`;
    setDiscounts(prev => [
      {
        ...d,
        id: newId, code: newCode,
        usedCount: resetUsage ? 0 : d.usedCount,
        status: setAsDraft ? "draft" : d.status,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    addToast("Duplicate created as draft.", "success");
  };

  const handleDeactivate = (d: Discount) => {
    setDiscounts(prev => prev.map(x => x.id === d.id ? { ...x, status: "draft" } : x));
    addToast(`"${d.code}" has been deactivated.`, "info");
  };

  const sortLabel = SORT_OPTIONS.find(s => s.key === sortKey)?.label ?? "Newest First";

  // Inline used-count style
  const usedStyle = (d: Discount) => {
    if (!d.usageLimit) return { color: T.text };
    const ratio = d.usedCount / d.usageLimit;
    if (ratio >= 1)   return { color: T.error };
    if (ratio >= 0.9) return { color: T.warning };
    return { color: T.text };
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes toastIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        :focus-visible { outline: 2px solid #00b566 !important; outline-offset: 2px !important; box-shadow: 0 0 0 3px rgba(0,181,102,0.25) !important; }
        @media (prefers-reduced-motion: reduce) { * { transition-duration: 0ms !important; animation-duration: 0ms !important; } }
      `}</style>

      <div style={{ padding: 24, maxWidth: 1600 }}>

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: T.muted }}>
          <Link href="/admin" style={{ color: T.muted, textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = T.accent)} onMouseLeave={e => (e.currentTarget.style.color = T.muted)}>Admin</Link>
          <span>/</span>
          <span aria-current="page" style={{ color: T.text }}>Discounts</span>
        </nav>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: T.text }}>Discounts &amp; Coupons</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: T.muted }}>
              {counts.all} total discounts · {counts.active} active
            </p>
          </div>
          <Link
            href="/admin/discounts/new"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 6,
              background: T.accent, color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
              transition: "opacity 150ms",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.87")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <Icon.Plus /> + Create Discount
          </Link>
        </div>

        {/* ── KPI Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
          {KPI_DATA.map(kpi => (
            <button
              key={kpi.label}
              aria-label={`${kpi.label}: ${kpi.value}`}
              onClick={() => {
                if (kpi.filterKey === "expiring") {
                  setSortKey("expiring_soonest");
                  setActiveTab("active");
                } else {
                  setActiveTab(kpi.filterKey as StatusTab);
                }
              }}
              style={{
                background: T.card,
                border: `1px solid ${T.borderMuted}`,
                borderRadius: 8,
                ...(kpi.label === "Expiring Soon (7 days)" ? { borderLeft: `3px solid ${T.warning}` } : {}),
                padding: 20,
                textAlign: "left", cursor: "pointer",
                transition: "background 150ms",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = T.elevated)}
              onMouseLeave={e => (e.currentTarget.style.background = T.card)}
            >
              <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 500, color: T.muted }}>{kpi.label}</p>
              <p style={{
                margin: 0, fontSize: 28, fontWeight: 800,
                color: kpi.type === "danger" ? T.error : kpi.type === "warning" ? T.warning : T.text,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {kpi.value}
                {kpi.type === "warning" && <span style={{ fontSize: 16 }}>⚠</span>}
              </p>
            </button>
          ))}
        </div>

        {/* ── Status Tabs ── */}
        <div
          role="tablist"
          aria-label="Filter by status"
          style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}
        >
          {STATUS_TABS.map(tab => {
            const count = tab.key === "all" ? counts.all : counts[tab.key as DiscountStatus] ?? 0;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  height: 36, padding: "0 16px", borderRadius: 6,
                  background: isActive ? T.accent : "transparent",
                  border: `1px solid ${isActive ? T.accent : T.border}`,
                  color: isActive ? "#fff" : T.muted,
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  cursor: "pointer", transition: "all 150ms",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget.style.background = T.elevated); }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget.style.background = "transparent"); }}
                onKeyDown={e => {
                  const tabs = STATUS_TABS;
                  const idx = tabs.findIndex(t => t.key === activeTab);
                  if (e.key === "ArrowRight") { e.preventDefault(); setActiveTab(tabs[(idx + 1) % tabs.length].key); }
                  if (e.key === "ArrowLeft")  { e.preventDefault(); setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length].key); }
                }}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* ── Toolbar ── */}
        {selectedIds.size > 0 ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: 16, padding: "10px 14px", borderRadius: 8,
            background: T.accentBg, border: `1px solid ${T.accent}`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>
              {selectedIds.size} selected
            </span>
            <div style={{ flex: 1 }} />
            {[
              { label: "Deactivate", action: bulkDeactivate },
              { label: "Export", action: () => addToast("Export started.", "info") },
            ].map(b => (
              <button key={b.label} onClick={b.action} style={{
                padding: "7px 14px", borderRadius: 6, border: `1px solid ${T.border}`,
                background: "transparent", color: T.text, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>{b.label}</button>
            ))}
            <button onClick={bulkDelete} style={{
              padding: "7px 14px", borderRadius: 6, border: `1px solid ${T.error}`,
              background: "transparent", color: T.error, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>Delete</button>
            <button onClick={() => setSelectedIds(new Set())} style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "7px 12px", borderRadius: 6, border: `1px solid ${T.border}`,
              background: "transparent", color: T.muted, fontSize: 12, cursor: "pointer",
            }}>
              <Icon.X /> Clear
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            {/* Search */}
            <div style={{ position: "relative", width: 320 }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.placeholder, pointerEvents: "none" }}>
                <Icon.Search />
              </span>
              <input
                ref={searchRef}
                aria-label="Search discounts"
                placeholder="Search by code or title…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", height: 36, padding: "0 12px 0 34px",
                  background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6,
                  color: T.text, fontSize: 13, outline: "none",
                  transition: "border-color 150ms",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = T.borderActive)}
                onBlur={e => (e.currentTarget.style.borderColor = T.border)}
              />
            </div>

            {/* Filter button (decorative for now) */}
            <button
              onClick={() => setFilterOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px",
                background: filterOpen ? T.elevated : "transparent",
                border: `1px solid ${T.border}`, borderRadius: 6,
                color: T.label, fontSize: 13, fontWeight: 500, cursor: "pointer",
                transition: "all 150ms",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = T.elevated)}
              onMouseLeave={e => { if (!filterOpen) (e.currentTarget.style.background = "transparent"); }}
            >
              <Icon.Filter /> Filter {filterOpen ? <Icon.ChevronUp /> : <Icon.ChevronDown />}
            </button>

            <div style={{ flex: 1 }} />

            {/* Sort */}
            <div ref={sortRef} style={{ position: "relative" }}>
              <button
                onClick={() => setSortOpen(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px",
                  background: sortOpen ? T.elevated : "transparent",
                  border: `1px solid ${T.border}`, borderRadius: 6,
                  color: T.label, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  transition: "all 150ms",
                }}
              >
                Sort: {sortLabel} {sortOpen ? <Icon.ChevronUp /> : <Icon.ChevronDown />}
              </button>
              {sortOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 4px)",
                  background: T.overlay, border: `1px solid ${T.border}`, borderRadius: 8,
                  width: 200, zIndex: 30, boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  overflow: "hidden",
                }}>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortKey(opt.key); setSortOpen(false); }}
                      style={{
                        display: "block", width: "100%", padding: "8px 14px",
                        background: sortKey === opt.key ? T.accentBg : "transparent",
                        border: "none",
                        color: sortKey === opt.key ? T.accent : T.text,
                        fontSize: 13, fontWeight: sortKey === opt.key ? 600 : 400,
                        cursor: "pointer", textAlign: "left",
                        transition: "background 150ms",
                      }}
                      onMouseEnter={e => { if (sortKey !== opt.key) (e.currentTarget.style.background = T.elevated); }}
                      onMouseLeave={e => { if (sortKey !== opt.key) (e.currentTarget.style.background = "transparent"); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div style={{ background: T.card, border: `1px solid ${T.borderMuted}`, borderRadius: 8, overflowX: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "64px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 40, opacity: 0.4 }}>{search ? "📭" : "🎟️"}</span>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: T.text }}>
                {search ? "No discounts found" : "No discounts created"}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: T.muted }}>
                {search ? "Try adjusting your filters or search." : "Create your first discount to offer deals to customers."}
              </p>
              {search ? (
                <button onClick={() => setSearch("")} style={{ marginTop: 8, padding: "8px 18px", borderRadius: 6, background: T.elevated, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Clear Filters
                </button>
              ) : (
                <Link href="/admin/discounts/new" style={{ marginTop: 8, padding: "8px 18px", borderRadius: 6, background: T.accent, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  + Create Discount
                </Link>
              )}
            </div>
          ) : (
            <table
              role="grid"
              aria-label="Discounts"
              style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.borderMuted}` }}>
                  {/* Checkbox */}
                  <th style={{ width: 44, padding: "12px 0 12px 16px" }}>
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                      style={{ accentColor: T.accent, width: 15, height: 15 }}
                    />
                  </th>
                  {[
                    { label: "CODE / TITLE", w: 220 },
                    { label: "TYPE",         w: 150 },
                    { label: "VALUE",        w: 90 },
                    { label: "METHOD",       w: 110 },
                    { label: "USED",         w: 110 },
                    { label: "MIN. ORDER",   w: 110 },
                    { label: "ACTIVE DATES", w: 200 },
                    { label: "STATUS",       w: 110 },
                    { label: "ACTIONS",      w: 120 },
                  ].map(col => (
                    <th
                      key={col.label}
                      role="columnheader"
                      style={{
                        width: col.w, padding: "12px 16px",
                        fontSize: 11, fontWeight: 700, color: T.label,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        textAlign: "left", whiteSpace: "nowrap",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map(d => {
                  const sc = statusConfig(d.status);
                  const isSelected = selectedIds.has(d.id);
                  const usedRatio = d.usageLimit ? d.usedCount / d.usageLimit : 0;
                  return (
                    <tr
                      key={d.id}
                      style={{
                        borderBottom: `1px solid ${T.borderMuted}`,
                        background: isSelected ? T.accentBg : "transparent",
                        transition: "background 150ms",
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = T.elevated; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {/* Select */}
                      <td style={{ padding: "12px 0 12px 16px" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(d.id)}
                          aria-label={`Select ${d.code}`}
                          style={{ accentColor: T.accent, width: 15, height: 15 }}
                        />
                      </td>
                      {/* Code / Title */}
                      <td style={{ padding: "12px 16px" }}>
                        <Link
                          href={`/admin/discounts/${d.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <span style={{
                            display: "block", fontFamily: "monospace", fontSize: 14,
                            fontWeight: 700, color: T.accent, letterSpacing: "0.05em",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            maxWidth: 190,
                          }}
                            title={d.code}
                          >
                            {d.code}
                          </span>
                          <span style={{ fontSize: 11, color: T.muted, display: "block", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 190 }}>
                            {d.title}
                          </span>
                        </Link>
                      </td>
                      {/* Type */}
                      <td style={{ padding: "12px 16px" }}><TypeBadge type={d.type} /></td>
                      {/* Value */}
                      <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: T.text }}>
                        {discountValueLabel(d)}
                      </td>
                      {/* Method */}
                      <td style={{ padding: "12px 16px" }}><MethodBadge method={d.method} /></td>
                      {/* Used */}
                      <td style={{ padding: "12px 16px", fontSize: 13, ...usedStyle(d) }}>
                        {d.usageLimit
                          ? <>{d.usedCount} / {d.usageLimit} {usedRatio >= 0.9 && usedRatio < 1 ? "⚠" : usedRatio >= 1 ? "✕" : ""}</>
                          : <>{d.usedCount} <span style={{ color: T.muted, fontSize: 11 }}>(unlimited)</span></>
                        }
                      </td>
                      {/* Min. Order */}
                      <td style={{ padding: "12px 16px", fontSize: 13, color: d.minOrderAmount ? T.text : T.muted }}>
                        {d.minOrderAmount ? `₹${d.minOrderAmount.toLocaleString("en-IN")}` : "—"}
                      </td>
                      {/* Active Dates */}
                      <td style={{ padding: "12px 16px", fontSize: 12, color: T.muted }}>
                        {formatDate(d.startDate)} →{" "}
                        {d.endDate ? formatDate(d.endDate) : <span style={{ color: T.text, fontStyle: "italic" }}>No end date</span>}
                      </td>
                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Link
                            href={`/admin/discounts/${d.id}`}
                            aria-label={`Edit ${d.code}`}
                            style={{
                              display: "flex", alignItems: "center", gap: 4,
                              padding: "5px 10px", borderRadius: 5,
                              background: T.elevated, border: `1px solid ${T.border}`,
                              color: T.text, fontSize: 12, fontWeight: 600,
                              textDecoration: "none", transition: "all 150ms",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.borderActive; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; }}
                          >
                            <Icon.Edit /> Edit
                          </Link>
                          <OverflowMenu
                            discount={d}
                            onDuplicate={disc => setDuplicateTarget(disc)}
                            onDelete={disc => setDeleteTarget(disc)}
                            onDeactivate={handleDeactivate}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <span style={{ fontSize: 13, color: T.muted }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} discounts
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, borderRadius: 6,
                  background: page === 1 ? "transparent" : T.elevated,
                  border: `1px solid ${T.border}`,
                  color: page === 1 ? T.placeholder : T.text,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                <Icon.ChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: page === n ? T.accent : "transparent",
                    border: `1px solid ${page === n ? T.accent : T.border}`,
                    color: page === n ? "#fff" : T.text,
                    fontSize: 13, fontWeight: page === n ? 700 : 400,
                    cursor: "pointer", transition: "all 150ms",
                  }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, borderRadius: 6,
                  background: page === totalPages ? "transparent" : T.elevated,
                  border: `1px solid ${T.border}`,
                  color: page === totalPages ? T.placeholder : T.text,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                }}
              >
                <Icon.ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {deleteTarget && (
        <DeleteModal
          discount={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
      {duplicateTarget && (
        <DuplicateModal
          discount={duplicateTarget}
          onClose={() => setDuplicateTarget(null)}
          onConfirm={(newCode, resetUsage, setAsDraft) => handleDuplicate(duplicateTarget, newCode, resetUsage, setAsDraft)}
        />
      )}

      {/* ── Toast Stack ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 300 }}>
        {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={dismissToast} />)}
      </div>
    </div>
  );
}
