"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MOCK_DISCOUNTS,
  Discount,
  DiscountType,
  DiscountMethod,
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
  accentBg: "rgba(0,181,102,0.06)",
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
  previewBg: "rgba(0,181,102,0.06)",
  conflictBg: "rgba(229,83,75,0.08)",
};

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const Icon = {
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  ),
  Zap: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
  ),
  AlertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
  ),
  Info: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
  ),
  ExternalLink: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
  ),
};

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDateDisplay(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function scheduleStatus(startDate: string, endDate?: string): string {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  if (end && now > end) return "Ended " + Math.round((now.getTime() - end.getTime()) / 86400000) + " days ago";
  if (now < start) {
    const diff = Math.round((start.getTime() - now.getTime()) / 86400000);
    return diff === 0 ? "Will activate today" : `Will activate in ${diff} day${diff > 1 ? "s" : ""}`;
  }
  return "Active now";
}

/* ─── Shared sub-components ──────────────────────────────────────────────────── */
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
      {children} {required && <span style={{ color: T.error }}>*</span>}
    </div>
  );
}

function HelpText({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "5px 0 0", fontSize: 11, color: T.muted }}>{children}</p>;
}

function InlineError({ message }: { message: string }) {
  return (
    <p role="alert" style={{ margin: "5px 0 0", fontSize: 11, fontWeight: 500, color: T.error }}>
      ⚠ {message}
    </p>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.borderMuted}`, borderRadius: 8,
      overflow: "hidden", marginBottom: 16,
    }}>
      <div style={{
        padding: "14px 20px", borderBottom: `1px solid ${T.borderMuted}`,
        fontSize: 15, fontWeight: 600, color: T.text,
      }}>{title}</div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

interface FormInput {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  suffix?: string;
  mono?: boolean;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  ariaDescribedby?: string;
  ariaRequired?: boolean;
}
function Input({ id, value, onChange, onBlur: onBlurProp, placeholder, type = "text", prefix, suffix, mono, error, disabled, maxLength, min, max, ariaDescribedby, ariaRequired }: FormInput) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && (
          <span style={{
            position: "absolute", left: 12, fontSize: 14, color: T.muted, pointerEvents: "none", fontWeight: 600,
          }}>{prefix}</span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          aria-required={ariaRequired}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedby}
          style={{
            width: "100%",
            height: 40,
            padding: `0 ${suffix ? 36 : 12}px 0 ${prefix ? 32 : 12}px`,
            background: disabled ? T.bg : T.elevated,
            border: `1px solid ${error ? T.error : focused ? T.borderActive : T.border}`,
            borderRadius: 6,
            color: disabled ? T.muted : (mono ? T.accent : T.text),
            fontSize: 13,
            fontFamily: mono ? "monospace" : "inherit",
            fontWeight: mono ? 700 : 400,
            outline: "none",
            cursor: disabled ? "not-allowed" : "text",
            boxShadow: focused ? T.focus : "none",
            transition: "border-color 150ms, box-shadow 150ms",
            textTransform: mono ? "uppercase" : "none",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlurProp?.(); }}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 12, fontSize: 14, color: T.muted, pointerEvents: "none" }}>{suffix}</span>
        )}
      </div>
      {error && <InlineError message={error} />}
    </div>
  );
}

/* ─── Main Create/Edit Page Component ──────────────────────────────────────────
   Supports both /admin/discounts/new and /admin/discounts/[id]
   Props: discountId (if editing) or undefined (if creating)
 */
interface DiscountFormPageProps {
  discountId?: string;
}

export default function DiscountFormPage({ discountId }: DiscountFormPageProps) {
  const router = useRouter();
  const isEditing = !!discountId;
  const existing = isEditing ? MOCK_DISCOUNTS.find((d: typeof MOCK_DISCOUNTS[0]) => d.id === discountId) : undefined;

  /* ─── Form state ── */
  const [method, setMethod] = useState<DiscountMethod>(existing?.method ?? "code");
  const [discountCode, setDiscountCode] = useState(
    (existing?.method === "code" ? existing?.code : "") ?? ""
  );
  const [title, setTitle] = useState(
    (existing?.method === "automatic" ? existing?.code : existing?.title) ?? ""
  );
  const [type, setType] = useState<DiscountType>(existing?.type ?? "percentage");
  const [value, setValue] = useState(String(existing?.value ?? ""));
  const [valueCap, setValueCap] = useState(String(existing?.valueCap ?? ""));
  const [capEnabled, setCapEnabled] = useState(!!existing?.valueCap);

  const [appliesTo, setAppliesTo] = useState<"all" | "collections" | "products" | "customers">(existing?.appliesTo ?? "all");
  const [excludeSaleItems, setExcludeSaleItems] = useState(false);

  const [eligibility, setEligibility] = useState<"all" | "segments" | "specific" | "tiers">(existing?.customerEligibility ?? "all");
  const [firstTimeOnly, setFirstTimeOnly] = useState(existing?.firstTimeOnly ?? false);

  const [minReq, setMinReq] = useState<"none" | "amount" | "quantity">(
    existing?.minOrderAmount ? "amount" : existing?.minQuantity ? "quantity" : "none"
  );
  const [minAmount, setMinAmount] = useState(String(existing?.minOrderAmount ?? ""));
  const [minQty, setMinQty] = useState(String(existing?.minQuantity ?? ""));

  const [usageLimitEnabled, setUsageLimitEnabled] = useState(!!existing?.usageLimit);
  const [usageLimitValue, setUsageLimitValue] = useState(String(existing?.usageLimit ?? ""));
  const [oncePerCustomer, setOncePerCustomer] = useState(true);

  const [combinesProduct, setCombinesProduct] = useState(existing?.combinesWithProduct ?? false);
  const [combinesOrder, setCombinesOrder] = useState(existing?.combinesWithOrder ?? false);
  const [combinesShipping, setCombinesShipping] = useState(existing?.combinesWithShipping ?? false);

  const [startDate, setStartDate] = useState(
    existing?.startDate ? new Date(existing.startDate).toISOString().split("T")[0] : todayStr()
  );
  const [startTime, setStartTime] = useState("00:00");
  const [endDateEnabled, setEndDateEnabled] = useState(!!existing?.endDate);
  const [endDate, setEndDate] = useState(
    existing?.endDate ? new Date(existing.endDate).toISOString().split("T")[0] : ""
  );
  const [endTime, setEndTime] = useState("23:59");

  // BOGO
  const [bogoBuyQty, setBogoBuyQty] = useState("2");
  const [bogoBuyScope, setBogoBuyScope] = useState<"any" | "collection" | "product">("any");
  const [bogoGetQty, setBogoGetQty] = useState("1");
  const [bogoGetScope, setBogoGetScope] = useState<"collection" | "product">("collection");
  const [bogoDiscount, setBogoDiscount] = useState<"100" | "50" | "fixed">("100");
  const [bogoFixedPrice, setBogoFixedPrice] = useState("");
  const [bogoLimitOnce, setBogoLimitOnce] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codeError, setCodeError] = useState("");

  // Toast
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const [nextToastId, setNextToastId] = useState(0);

  const addToast = useCallback((msg: string, type = "success") => {
    setNextToastId(id => {
      const newId = id + 1;
      setToasts(prev => [...prev, { id: newId, msg, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== newId)), 3500);
      return newId;
    });
  }, []);

  // Code uniqueness check (simulated)
  const checkCodeUnique = useCallback((code: string) => {
    if (!code) return;
    const conflict = MOCK_DISCOUNTS.find(
      (d: typeof MOCK_DISCOUNTS[0]) => d.code === code && d.method === "code" && d.id !== discountId
    );
    if (conflict) {
      setCodeError(`This code is already in use by "${conflict.title}".`);
    } else {
      setCodeError("");
    }
  }, [discountId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  /* ─── Validation ── */
  function validate(forActivate: boolean): Record<string, string> {
    const errs: Record<string, string> = {};
    if (method === "code" && !discountCode.trim()) errs.code = "Discount code is required.";
    if (method === "automatic" && !title.trim()) errs.title = "Discount title is required.";
    if (type !== "shipping" && !value) errs.value = type === "percentage" ? "Percentage must be between 1 and 100." : "Discount amount must be greater than ₹0.";
    if (type === "percentage" && value && (Number(value) < 1 || Number(value) > 100)) errs.value = "Percentage must be between 1 and 100.";
    if (type === "fixed" && value && Number(value) <= 0) errs.value = "Discount amount must be greater than ₹0.";
    if (!startDate) errs.startDate = "Start date is required.";
    if (endDateEnabled && endDate && endDate <= startDate) errs.endDate = "End date must be after the start date.";
    if (usageLimitEnabled && usageLimitValue && Number(usageLimitValue) < 1) errs.usageLimit = "Usage limit must be at least 1.";
    if (minReq === "amount" && minAmount && Number(minAmount) <= 0) errs.minAmount = "Minimum purchase amount must be greater than ₹0.";
    return errs;
  }

  function handleSaveDraft() {
    const errs = validate(false);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    addToast(isEditing ? "Changes saved as draft." : "Discount saved as draft.", "success");
    setTimeout(() => router.push("/admin/discounts"), 1200);
  }

  function handleActivate() {
    const errs = validate(true);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      addToast("Fix the errors before activating.", "error");
      return;
    }
    const code = method === "code" ? discountCode : title;
    addToast(`"${code}" is now active.`, "success");
    setTimeout(() => router.push("/admin/discounts"), 1200);
  }

  /* ─── Derived live preview values ── */
  const previewSubtotal = 1098;
  const previewDiscount = (() => {
    if (type === "percentage" && value) {
      const pct = Math.min(Number(value), 100);
      const raw = Math.round(previewSubtotal * pct / 100);
      return valueCap && capEnabled ? Math.min(raw, Number(valueCap)) : raw;
    }
    if (type === "fixed" && value) return Math.min(Number(value), previewSubtotal);
    return 0;
  })();

  /* ─── Usage stats sparkline ── */
  const trend = existing?.usageTrend ?? [];
  const maxTrend = Math.max(...trend, 1);

  const lockedByUsage = isEditing && (existing?.usedCount ?? 0) > 0;

  const typeOptions: { key: DiscountType; icon: string; label: string }[] = [
    { key: "percentage", icon: "%", label: "Percentage" },
    { key: "fixed",      icon: "₹", label: "Fixed Amount" },
    { key: "shipping",   icon: "🚚", label: "Free Shipping" },
    { key: "bogo",       icon: "🎁", label: "Buy X Get Y" },
  ];

  const summaryRows: { label: string; value: string }[] = [
    { label: "Type",           value: typeOptions.find(t => t.key === type)?.label ?? "—" },
    { label: "Value",          value: type === "percentage" ? `${value || "—"}% off` : type === "fixed" ? `₹${value || "—"}` : type === "shipping" ? "Free shipping" : "Buy X Get Y" },
    { label: method === "code" ? "Code" : "Title", value: method === "code" ? (discountCode || "—") : (title || "—") },
    { label: "Applies to",     value: appliesTo === "all" ? "All products" : appliesTo === "collections" ? "Specific collections" : appliesTo === "products" ? "Specific products" : "Specific customers" },
    { label: "Min. purchase",  value: minReq === "amount" && minAmount ? `₹${minAmount}` : minReq === "quantity" && minQty ? `${minQty} items` : "None" },
    { label: "Customer",       value: eligibility === "all" ? "All customers" : eligibility === "tiers" ? "Specific tiers" : eligibility === "segments" ? "Segments" : "Specific customers" },
    { label: "Dates",          value: `${formatDateDisplay(startDate)} → ${endDateEnabled && endDate ? formatDateDisplay(endDate) : "No end date"}` },
    { label: "Combinations",   value: (combinesProduct || combinesOrder || combinesShipping) ? "Can combine" : "Cannot combine" },
  ];

  function RadioGroup({ groupLabel, value: val, onChange: onChangeFn, options, disabled }: {
    groupLabel: string;
    value: string;
    onChange: (v: string) => void;
    options: { key: string; label: string; description?: string }[];
    disabled?: boolean;
  }) {
    return (
      <div role="radiogroup" aria-label={groupLabel} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map(opt => (
          <label
            key={opt.key}
            style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <input
              type="radio"
              name={groupLabel}
              value={opt.key}
              checked={val === opt.key}
              onChange={() => !disabled && onChangeFn(opt.key)}
              disabled={disabled}
              style={{ accentColor: T.accent, marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{opt.label}</span>
              {opt.description && <p style={{ margin: "2px 0 0", fontSize: 12, color: T.muted }}>{opt.description}</p>}
            </div>
          </label>
        ))}
      </div>
    );
  }

  const statusBadge = isEditing ? existing?.status ?? "draft" : null;
  const statusColors: Record<string, { color: string; bg: string }> = {
    active:    { color: T.success, bg: T.successBg },
    scheduled: { color: T.warning, bg: T.warningBg },
    expired:   { color: T.error,   bg: T.errorBg },
    draft:     { color: T.info,    bg: T.infoBg },
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        :focus-visible { outline: 2px solid #00b566 !important; outline-offset: 2px !important; box-shadow: 0 0 0 3px rgba(0,181,102,0.25) !important; }
        @keyframes toastIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @media (prefers-reduced-motion: reduce) { * { transition-duration: 0ms !important; animation-duration: 0ms !important; } }
      `}</style>

      <div style={{ padding: 24, maxWidth: 1400 }}>

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: T.muted }}>
          <Link href="/admin" style={{ color: T.muted, textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = T.accent)} onMouseLeave={e => (e.currentTarget.style.color = T.muted)}>Admin</Link>
          <span>/</span>
          <Link href="/admin/discounts" style={{ color: T.muted, textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = T.accent)} onMouseLeave={e => (e.currentTarget.style.color = T.muted)}>Discounts</Link>
          <span>/</span>
          <span aria-current="page" style={{ color: T.text }}>{isEditing ? (existing?.code ?? "Edit") : "Create Discount"}</span>
        </nav>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: T.text }}>
              {isEditing ? (existing?.code ?? "Edit Discount") : "Create Discount"}
            </h1>
            {isEditing && existing && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: T.muted }}>
                Created {formatDateDisplay(existing.createdAt)} by {existing.createdBy}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isEditing && statusBadge && (
              <span style={{
                padding: "4px 12px", borderRadius: 9999,
                background: statusColors[statusBadge]?.bg,
                color: statusColors[statusBadge]?.color,
                fontSize: 12, fontWeight: 700,
              }}>
                {statusBadge.charAt(0).toUpperCase() + statusBadge.slice(1)}
              </span>
            )}
            <Link href="/admin/discounts" style={{
              padding: "8px 16px", borderRadius: 6, border: `1px solid ${T.border}`,
              background: "transparent", color: T.text, fontSize: 13, fontWeight: 600,
              textDecoration: "none", cursor: "pointer",
            }}>
              Discard
            </Link>
            <button onClick={handleSaveDraft} style={{
              padding: "8px 16px", borderRadius: 6, border: `1px solid ${T.border}`,
              background: "transparent", color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 150ms",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = T.elevated)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {isEditing ? "Save" : "Save as Draft"}
            </button>
            <button onClick={handleActivate} style={{
              padding: "8px 18px", borderRadius: 6, border: "none",
              background: T.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "opacity 150ms",
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.87")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              {isEditing ? "Reactivate" : "Activate"}
            </button>
          </div>
        </div>

        {/* ── Validation summary ── */}
        {Object.keys(errors).length > 0 && (
          <div role="alert" aria-live="assertive" style={{
            padding: 16, borderRadius: 8, marginBottom: 20,
            background: T.errorBg, border: `1px solid ${T.error}`,
          }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: T.error }}>
              ✕ This discount can&apos;t be activated yet. Fix {Object.keys(errors).length} issue{Object.keys(errors).length > 1 ? "s" : ""}:
            </p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {Object.values(errors).map(err => (
                <li key={err} style={{ fontSize: 12, color: T.text, marginBottom: 2 }}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "62% 38%", gap: 24, alignItems: "start" }}>

          {/* ══════════════ LEFT COLUMN ══════════════ */}
          <div>

            {/* §5.2 Discount Method */}
            <Panel title="Discount Method">
              <RadioGroup
                groupLabel="Discount method"
                value={method}
                onChange={v => setMethod(v as DiscountMethod)}
                disabled={lockedByUsage}
                options={[
                  { key: "code", label: "Discount Code", description: "Customer enters a code at checkout" },
                  { key: "automatic", label: "Automatic Discount", description: "Applied automatically when conditions are met — no code needed" },
                ]}
              />
              {lockedByUsage && (
                <p style={{ marginTop: 10, fontSize: 11, color: T.warning }}>
                  ⚠ Cannot be changed after first use. Duplicate this discount to create a new one.
                </p>
              )}
            </Panel>

            {/* §5.3 Code / Title */}
            <Panel title={method === "code" ? "Discount Code" : "Discount Title"}>
              {method === "code" ? (
                <>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 4 }}>
                    <div style={{ flex: 1 }}>
                      <Label required>Code</Label>
                      <Input
                        id="discount-code"
                        value={discountCode}
                        onChange={v => setDiscountCode(v.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                        placeholder="e.g. HERO20"
                        mono
                        error={errors.code || codeError}
                        ariaRequired
                        ariaDescribedby="code-help code-error"
                        maxLength={255}
                        onBlur={() => checkCodeUnique(discountCode)}
                      />
                    </div>
                    <button
                      onClick={() => setDiscountCode(randomCode())}
                      style={{
                        padding: "0 14px", height: 40, borderRadius: 6,
                        background: "transparent", border: `1px solid ${T.border}`,
                        color: T.text, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
                        transition: "all 150ms",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = T.elevated)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <Icon.Zap /> Generate Random
                    </button>
                  </div>
                  <HelpText>Customers enter this at checkout. {discountCode.length}/255 characters used.</HelpText>
                </>
              ) : (
                <>
                  <Label required>Title</Label>
                  <Input
                    value={title}
                    onChange={setTitle}
                    placeholder="e.g. Free Shipping Over ₹499"
                    error={errors.title}
                    ariaRequired
                    maxLength={255}
                  />
                  <HelpText>Internal — customers see this in cart, not a code.</HelpText>
                </>
              )}
            </Panel>

            {/* §5.4 Discount Type & Value */}
            <Panel title="Discount Type">
              {/* Type selector cards */}
              <div
                role="radiogroup"
                aria-label="Discount type"
                style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}
              >
                {typeOptions.map(opt => (
                  <button
                    key={opt.key}
                    role="radio"
                    aria-checked={type === opt.key}
                    onClick={() => !lockedByUsage && setType(opt.key)}
                    disabled={lockedByUsage}
                    style={{
                      padding: "14px 8px",
                      borderRadius: 6,
                      background: type === opt.key ? T.accentBg : T.card,
                      border: `2px solid ${type === opt.key ? T.accent : T.border}`,
                      color: type === opt.key ? T.accent : T.text,
                      cursor: lockedByUsage ? "not-allowed" : "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      fontSize: 22, transition: "all 200ms",
                    }}
                    onMouseEnter={e => { if (!lockedByUsage && type !== opt.key) (e.currentTarget as HTMLElement).style.borderColor = T.muted; }}
                    onMouseLeave={e => { if (!lockedByUsage && type !== opt.key) (e.currentTarget as HTMLElement).style.borderColor = T.border; }}
                  >
                    <span>{opt.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: type === opt.key ? T.accent : T.muted }}>{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Value inputs */}
              {type === "percentage" && (
                <div>
                  <Label required>Value</Label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 120 }}>
                      <Input
                        value={value}
                        onChange={setValue}
                        type="number"
                        placeholder="20"
                        suffix="%"
                        error={errors.value}
                        min={1}
                        max={100}
                      />
                    </div>
                  </div>
                  {/* Cap */}
                  <div style={{ marginTop: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 8 }}>
                      <input type="checkbox" checked={capEnabled} onChange={e => setCapEnabled(e.target.checked)} style={{ accentColor: T.accent, width: 15, height: 15 }} />
                      <span style={{ fontSize: 13, color: T.text }}>Cap maximum discount amount</span>
                    </label>
                    {capEnabled && (
                      <div style={{ width: 180 }}>
                        <Input value={valueCap} onChange={setValueCap} type="number" placeholder="500" prefix="₹" />
                        <HelpText>E.g. {value || "20"}% off, capped at ₹{valueCap || "500"} maximum discount</HelpText>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {type === "fixed" && (
                <div>
                  <Label required>Value</Label>
                  <div style={{ width: 180 }}>
                    <Input value={value} onChange={setValue} type="number" placeholder="100" prefix="₹" error={errors.value} />
                  </div>
                </div>
              )}

              {type === "shipping" && (
                <p style={{ margin: 0, fontSize: 13, color: T.muted, padding: "8px 0" }}>
                  Free shipping is applied when the customer meets the minimum requirements below.
                </p>
              )}

              {type === "bogo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* BUY */}
                  <div>
                    <Label>Buy</Label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ width: 90 }}>
                        <Input value={bogoBuyQty} onChange={setBogoBuyQty} type="number" placeholder="2" min={1} />
                      </div>
                      <span style={{ fontSize: 13, color: T.muted }}>of</span>
                      <select
                        value={bogoBuyScope}
                        onChange={e => setBogoBuyScope(e.target.value as "any" | "collection" | "product")}
                        style={{ padding: "8px 12px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontSize: 13, outline: "none" }}
                      >
                        <option value="any">Any product in:</option>
                        <option value="collection">Specific collection</option>
                        <option value="product">Specific product</option>
                      </select>
                      {bogoBuyScope !== "any" && (
                        <button style={{ padding: "8px 14px", borderRadius: 6, background: T.elevated, border: `1px solid ${T.border}`, color: T.muted, fontSize: 12, cursor: "pointer" }}>
                          Select {bogoBuyScope === "collection" ? "collection" : "product"} ▾
                        </button>
                      )}
                    </div>
                  </div>
                  {/* GET */}
                  <div>
                    <Label>Get</Label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ width: 90 }}>
                        <Input value={bogoGetQty} onChange={setBogoGetQty} type="number" placeholder="1" min={1} />
                      </div>
                      <span style={{ fontSize: 13, color: T.muted }}>of</span>
                      <select
                        value={bogoGetScope}
                        onChange={e => setBogoGetScope(e.target.value as "collection" | "product")}
                        style={{ padding: "8px 12px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontSize: 13, outline: "none" }}
                      >
                        <option value="collection">Specific collection</option>
                        <option value="product">Specific product</option>
                      </select>
                      <button style={{ padding: "8px 14px", borderRadius: 6, background: T.elevated, border: `1px solid ${T.border}`, color: T.muted, fontSize: 12, cursor: "pointer" }}>
                        Select ▾
                      </button>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <span style={{ fontSize: 12, color: T.label, fontWeight: 600 }}>at</span>
                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        {(["100", "50", "fixed"] as const).map(opt => (
                          <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input type="radio" name="bogo-discount" value={opt} checked={bogoDiscount === opt} onChange={() => setBogoDiscount(opt)} style={{ accentColor: T.accent }} />
                            <span style={{ fontSize: 13, color: T.text }}>{opt === "100" ? "100% off" : opt === "50" ? "50% off" : "Fixed price:"}</span>
                            {opt === "fixed" && bogoDiscount === "fixed" && (
                              <div style={{ width: 100 }}>
                                <Input value={bogoFixedPrice} onChange={setBogoFixedPrice} type="number" placeholder="0" prefix="₹" />
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer" }}>
                      <input type="checkbox" checked={bogoLimitOnce} onChange={e => setBogoLimitOnce(e.target.checked)} style={{ accentColor: T.accent, width: 15, height: 15 }} />
                      <span style={{ fontSize: 13, color: T.text }}>Limit to once per order</span>
                    </label>
                  </div>
                </div>
              )}
            </Panel>

            {/* §5.5 Applies To */}
            <Panel title="Applies To">
              <RadioGroup
                groupLabel="Applies to"
                value={appliesTo}
                onChange={v => setAppliesTo(v as typeof appliesTo)}
                options={[
                  { key: "all", label: "All products" },
                  { key: "collections", label: "Specific collections" },
                  { key: "products", label: "Specific products" },
                  { key: "customers", label: "Specific customers" },
                ]}
              />
              {(appliesTo === "collections" || appliesTo === "products") && (
                <div style={{ marginTop: 12, marginLeft: 22 }}>
                  <input
                    placeholder={`Search ${appliesTo}…`}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 6,
                      background: T.elevated, border: `1px solid ${T.border}`,
                      color: T.text, fontSize: 13, outline: "none",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = T.borderActive)}
                    onBlur={e => (e.currentTarget.style.borderColor = T.border)}
                  />
                  {appliesTo === "collections" && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {["Indoor Plants", "Air Purifying"].map(tag => (
                        <span key={tag} style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "3px 10px", borderRadius: 9999,
                          background: T.accentBg, border: `1px solid ${T.accent}`,
                          color: T.accent, fontSize: 12, fontWeight: 600,
                        }}>
                          {tag}
                          <button style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", padding: 0, display: "flex" }}><Icon.X /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Exclude */}
              <div style={{ marginTop: 16, borderTop: `1px solid ${T.borderMuted}`, paddingTop: 16 }}>
                <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: T.label, textTransform: "uppercase", letterSpacing: "0.06em" }}>Exclude</p>
                {[
                  { label: "Exclude sale items", key: "sale", checked: excludeSaleItems, set: setExcludeSaleItems },
                ].map(cb => (
                  <label key={cb.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 8 }}>
                    <input type="checkbox" checked={cb.checked} onChange={e => cb.set(e.target.checked)} style={{ accentColor: T.accent, width: 15, height: 15 }} />
                    <span style={{ fontSize: 13, color: T.text }}>{cb.label}</span>
                  </label>
                ))}
              </div>
            </Panel>

            {/* §5.6 Customer Eligibility */}
            <Panel title="Customer Eligibility">
              <RadioGroup
                groupLabel="Customer eligibility"
                value={eligibility}
                onChange={v => setEligibility(v as typeof eligibility)}
                options={[
                  { key: "all",      label: "All customers" },
                  { key: "segments", label: "Specific customer segments", description: "e.g. \"VIP Customers\", \"At-Risk\"" },
                  { key: "specific", label: "Specific customers" },
                  { key: "tiers",    label: "Specific loyalty tiers" },
                ]}
              />
              {eligibility === "tiers" && (
                <div style={{ display: "flex", gap: 12, marginTop: 10, marginLeft: 22, flexWrap: "wrap" }}>
                  {["Plant Lover", "Silver", "Gold"].map(tier => (
                    <label key={tier} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <input type="checkbox" style={{ accentColor: T.accent }} />
                      <span style={{ fontSize: 13, color: T.text }}>{tier}</span>
                    </label>
                  ))}
                </div>
              )}
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={firstTimeOnly} onChange={e => setFirstTimeOnly(e.target.checked)} style={{ accentColor: T.accent, width: 15, height: 15 }} />
                <span style={{ fontSize: 13, color: T.text }}>First-time customers only</span>
              </label>
              {firstTimeOnly && (
                <HelpText>Only customers placing their very first order will see this discount.</HelpText>
              )}
            </Panel>

            {/* §5.7 Minimum Requirements */}
            <Panel title="Minimum Requirements">
              <RadioGroup
                groupLabel="Minimum requirements"
                value={minReq}
                onChange={v => setMinReq(v as typeof minReq)}
                options={[
                  { key: "none",     label: "No minimum requirement" },
                  { key: "amount",   label: "Minimum purchase amount" },
                  { key: "quantity", label: "Minimum quantity of items" },
                ]}
              />
              {minReq === "amount" && (
                <div style={{ marginTop: 10, marginLeft: 22, width: 180 }}>
                  <Input value={minAmount} onChange={setMinAmount} type="number" placeholder="500" prefix="₹" error={errors.minAmount} />
                </div>
              )}
              {minReq === "quantity" && (
                <div style={{ marginTop: 10, marginLeft: 22, width: 140 }}>
                  <Input value={minQty} onChange={setMinQty} type="number" placeholder="3" suffix="items" />
                </div>
              )}
            </Panel>

            {/* §5.8 Usage Limits */}
            <Panel title="Usage Limits">
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", marginBottom: 14 }}>
                <input type="checkbox" checked={usageLimitEnabled} onChange={e => setUsageLimitEnabled(e.target.checked)} style={{ accentColor: T.accent, width: 15, height: 15, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: T.text }}>Limit number of times this discount can be used in total</span>
                  {usageLimitEnabled && (
                    <div style={{ marginTop: 8, width: 180 }}>
                      <Input value={usageLimitValue} onChange={setUsageLimitValue} type="number" placeholder="100" error={errors.usageLimit} />
                    </div>
                  )}
                  {isEditing && existing && usageLimitEnabled && existing.usageLimit && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12, color: T.muted }}>
                        <span>Used {existing.usedCount} of {existing.usageLimit} ({Math.round(existing.usedCount / existing.usageLimit * 100)}%)</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 9999, background: T.border, overflow: "hidden" }}>
                        <div
                          role="progressbar"
                          aria-valuenow={existing.usedCount}
                          aria-valuemin={0}
                          aria-valuemax={existing.usageLimit}
                          aria-label={`${existing.usedCount} of ${existing.usageLimit} uses`}
                          style={{
                            height: "100%",
                            width: `${Math.min(100, (existing.usedCount / existing.usageLimit) * 100)}%`,
                            borderRadius: 9999,
                            background: existing.usedCount / existing.usageLimit >= 1 ? T.error :
                              existing.usedCount / existing.usageLimit >= 0.9 ? T.warning : T.accent,
                            transition: "width 400ms ease",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={oncePerCustomer} onChange={e => setOncePerCustomer(e.target.checked)} style={{ accentColor: T.accent, width: 15, height: 15 }} />
                <span style={{ fontSize: 13, color: T.text }}>Limit to one use per customer</span>
              </label>
            </Panel>

            {/* §5.9 Combinations */}
            <Panel title="Combinations">
              <p style={{ margin: "0 0 12px", fontSize: 13, color: T.text }}>This discount can be combined with:</p>
              {[
                { label: "Product discounts",  val: combinesProduct,  set: setCombinesProduct },
                { label: "Order discounts",    val: combinesOrder,    set: setCombinesOrder },
                { label: "Shipping discounts", val: combinesShipping, set: setCombinesShipping },
              ].map(cb => (
                <label key={cb.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={cb.val} onChange={e => cb.set(e.target.checked)} style={{ accentColor: T.accent, width: 15, height: 15 }} />
                  <span style={{ fontSize: 13, color: T.text }}>{cb.label}</span>
                </label>
              ))}
              <div style={{
                display: "flex", gap: 8, padding: 12, borderRadius: 6,
                background: T.elevated, border: `1px solid ${T.borderMuted}`,
                marginTop: 8,
              }}>
                <span style={{ color: T.info, flexShrink: 0 }}><Icon.Info /></span>
                <p style={{ margin: 0, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                  By default, discounts cannot be combined with other discounts of the same category, to prevent unintended stacking.
                </p>
              </div>
            </Panel>

            {/* §5.10 Active Dates */}
            <Panel title="Active Dates">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10, marginBottom: 14 }}>
                <div>
                  <Label required>Start Date</Label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{
                      width: "100%", height: 40, padding: "0 12px", borderRadius: 6,
                      background: T.elevated, border: `1px solid ${errors.startDate ? T.error : T.border}`,
                      color: T.text, fontSize: 13, outline: "none",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = T.borderActive)}
                    onBlur={e => (e.currentTarget.style.borderColor = errors.startDate ? T.error : T.border)}
                  />
                  {errors.startDate && <InlineError message={errors.startDate} />}
                </div>
                <div>
                  <Label>Time</Label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    style={{
                      width: "100%", height: 40, padding: "0 10px", borderRadius: 6,
                      background: T.elevated, border: `1px solid ${T.border}`,
                      color: T.text, fontSize: 13, outline: "none",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = T.borderActive)}
                    onBlur={e => (e.currentTarget.style.borderColor = T.border)}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 12 }}>
                <input type="checkbox" checked={endDateEnabled} onChange={e => setEndDateEnabled(e.target.checked)} style={{ accentColor: T.accent, width: 15, height: 15 }} />
                <span style={{ fontSize: 13, color: T.text }}>Set end date</span>
              </label>

              {endDateEnabled && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
                  <div>
                    <Label>End Date</Label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={e => setEndDate(e.target.value)}
                      style={{
                        width: "100%", height: 40, padding: "0 12px", borderRadius: 6,
                        background: T.elevated, border: `1px solid ${errors.endDate ? T.error : T.border}`,
                        color: T.text, fontSize: 13, outline: "none",
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = T.borderActive)}
                      onBlur={e => (e.currentTarget.style.borderColor = errors.endDate ? T.error : T.border)}
                    />
                    {errors.endDate && <InlineError message={errors.endDate} />}
                  </div>
                  <div>
                    <Label>Time</Label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      style={{
                        width: "100%", height: 40, padding: "0 10px", borderRadius: 6,
                        background: T.elevated, border: `1px solid ${T.border}`,
                        color: T.text, fontSize: 13, outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}

              <p style={{ margin: "12px 0 0", fontSize: 11, color: T.placeholder }}>Timezone: Asia/Kolkata (IST)</p>
            </Panel>
          </div>

          {/* ══════════════ RIGHT COLUMN ══════════════ */}
          <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* §6.1 Summary */}
            <div style={{ background: T.card, border: `1px solid ${T.borderMuted}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.borderMuted}`, fontSize: 15, fontWeight: 600 }}>Summary</div>
              <div style={{ padding: 16 }}>
                {summaryRows.map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.borderMuted}` }}>
                    <span style={{ fontSize: 12, color: T.muted }}>{row.label}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: row.value === "—" ? T.muted : T.text,
                      fontStyle: row.value === "—" ? "italic" : "normal",
                      textAlign: "right", maxWidth: "55%",
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* §6.2 Live Preview */}
            <div style={{
              background: T.previewBg, border: `1px solid rgba(0,181,102,0.3)`,
              borderRadius: 8, overflow: "hidden",
            }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid rgba(0,181,102,0.15)`, fontSize: 15, fontWeight: 600 }}>Customer Preview</div>
              <div style={{ padding: 16 }}>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: T.muted }}>
                  {method === "code" ? "At checkout:" : "In cart automatically:"}
                </p>
                <div style={{ background: T.elevated, borderRadius: 6, padding: 12, fontSize: 13 }}>
                  {method === "code" && (
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <input
                        readOnly
                        value={discountCode || "CODE"}
                        style={{
                          flex: 1, padding: "6px 10px", borderRadius: 4,
                          background: T.overlay, border: `1px solid ${T.border}`,
                          color: T.accent, fontSize: 12, fontFamily: "monospace", fontWeight: 700,
                        }}
                      />
                      <span style={{ padding: "6px 10px", borderRadius: 4, background: T.accent, color: "#fff", fontSize: 12, fontWeight: 600 }}>Apply</span>
                    </div>
                  )}
                  {(type === "percentage" || type === "fixed") && value && (
                    <p style={{ margin: "0 0 8px", fontSize: 12, color: T.success, fontWeight: 600 }}>
                      ✓ {discountCode || title || "Discount"} applied — {type === "percentage" ? `${value}% off` : `₹${value} off`}
                    </p>
                  )}
                  {type === "shipping" && (
                    <p style={{ margin: "0 0 8px", fontSize: 12, color: T.success, fontWeight: 600 }}>
                      🎉 {title || "Free Shipping"} applied
                    </p>
                  )}
                  {type === "bogo" && (
                    <p style={{ margin: "0 0 8px", fontSize: 12, color: T.success, fontWeight: 600 }}>
                      🎁 Buy X Get Y offer applied!
                    </p>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: T.muted, fontSize: 12 }}>
                      <span>Subtotal</span><span>₹{previewSubtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {previewDiscount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: T.error, fontSize: 12, fontWeight: 600 }}>
                        <span>Discount ({discountCode || title || "—"})</span>
                        <span>−₹{previewDiscount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {type === "shipping" && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: T.accent, fontSize: 12, fontWeight: 600 }}>
                        <span>Shipping</span><span>₹0</span>
                      </div>
                    )}
                    <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 4, paddingTop: 4, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13 }}>
                      <span>Total</span>
                      <span>₹{(previewSubtotal - previewDiscount).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* §6.3 Conflict Warning (example, shown when 2 active overlapping discounts) */}
            {method === "code" && discountCode === "HERO20-TEST" && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  background: T.conflictBg,
                  border: `1px solid ${T.error}`,
                  borderLeft: `4px solid ${T.error}`,
                  borderRadius: 8, padding: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: T.error }}>
                  <Icon.AlertTriangle />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Potential Conflict</span>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: T.text, lineHeight: 1.5 }}>
                  &quot;WELCOME15&quot; is also active for All Products during an overlapping date range.
                  Since both apply to Order discounts and combinations are disabled, only one will apply at checkout (whichever is higher value).
                </p>
                <Link href="/admin/discounts/dsc-002" style={{ fontSize: 12, color: T.error, textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  View WELCOME15 <Icon.ChevronRight />
                </Link>
              </div>
            )}

            {/* §6.4 Schedule Card */}
            <div style={{ background: T.card, border: `1px solid ${T.borderMuted}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.borderMuted}`, fontSize: 15, fontWeight: 600 }}>Schedule</div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Starts", value: startDate ? `${formatDateDisplay(startDate)}, ${startTime}` : "—" },
                  { label: "Ends",   value: endDateEnabled && endDate ? `${formatDateDisplay(endDate)}, ${endTime}` : "No end date" },
                  { label: "Status", value: startDate ? scheduleStatus(startDate, endDateEnabled && endDate ? endDate : undefined) : "—" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: T.muted }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text, textAlign: "right", maxWidth: "60%" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* §6.5 Usage Stats (edit mode) */}
            {isEditing && existing && (
              <div style={{ background: T.card, border: `1px solid ${T.borderMuted}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.borderMuted}`, fontSize: 15, fontWeight: 600 }}>Usage Stats</div>
                <div style={{ padding: 16 }}>
                  {[
                    { label: "Times used",           value: String(existing.usedCount) },
                    { label: "Total discount given",  value: existing.totalDiscountGiven ? `₹${existing.totalDiscountGiven.toLocaleString("en-IN")}` : "—" },
                    { label: "Orders using this",     value: existing.ordersUsing ? String(existing.ordersUsing) : "—" },
                    { label: "Avg order value",       value: existing.avgOrderValue ? `₹${existing.avgOrderValue.toLocaleString("en-IN")}` : "—" },
                    { label: "Revenue generated",     value: existing.revenueGenerated ? `₹${existing.revenueGenerated.toLocaleString("en-IN")}` : "—" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.borderMuted}` }}>
                      <span style={{ fontSize: 12, color: T.muted }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{row.value}</span>
                    </div>
                  ))}

                  <button
                    onClick={() => router.push(`/admin/discounts/${discountId}?tab=report`)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4, marginTop: 12,
                      background: "transparent", border: "none",
                      color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    View Full Report <Icon.ExternalLink />
                  </button>

                  {/* Sparkline */}
                  {trend.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 11, color: T.muted }}>Last 30 days:</p>
                      <div
                        role="img"
                        aria-label="Usage trend over last 30 days"
                        style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 40 }}
                      >
                        {trend.map((v: number, i: number) => (
                          <div
                            key={i}
                            title={`Day ${i + 1}: ${v} uses`}
                            style={{
                              flex: 1, borderRadius: 2,
                              height: `${Math.max(2, (v / maxTrend) * 100)}%`,
                              background: T.accent,
                              opacity: 0.6 + (v / maxTrend) * 0.4,
                              transition: "height 300ms ease",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast Stack ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 300 }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              padding: "12px 16px", borderRadius: 8, minWidth: 260,
              background: t.type === "error" ? T.errorBg : t.type === "success" ? T.successBg : T.accentBg,
              border: `1px solid ${t.type === "error" ? T.error : t.type === "success" ? T.success : T.accent}`,
              color: t.type === "error" ? T.error : t.type === "success" ? T.success : T.accent,
              fontSize: 13, fontWeight: 600,
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              animation: "toastIn 200ms ease-out",
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
