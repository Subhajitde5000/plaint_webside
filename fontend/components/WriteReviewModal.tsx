"use client";

import { useState, useEffect } from "react";
import { useSubmitReview, useMyReviews, useEditReview } from "@/features/reviews";

/* ── Types ──────────────────────────────────────────────────────────────── */
export interface ReviewableItem {
  product_id: number;
  order_item_id: number;
  title: string;
  variant_title?: string | null;
  image_url?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Items in the order the user can choose to review. */
  items: ReviewableItem[];
  /** Called after a successful or failed submission. */
  onResult: (msg: string, type: "success" | "error") => void;
}

/* ── Design constants (neutral palette, works on any page) ──────────────── */
const C = {
  green:     "#00b566",
  greenPale: "rgba(0,181,102,0.08)",
  amber:     "#f59e0b",
  starEmpty: "#d1d5db",
  red:       "#dc2626",
  heading:   "#1c1c1c",
  body:      "#333",
  muted:     "#7c7c7c",
  border:    "rgba(0,0,0,0.10)",
  bg:        "#fefcf9",
  bgMuted:   "#f7f5f0",
};

/* ── Star Picker ─────────────────────────────────────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["Terrible", "Poor", "Average", "Good", "Excellent"];
  const active = hovered || value;
  return (
    <div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i} star`}
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 2,
              fontSize: 32, lineHeight: 1,
              color: active >= i ? C.amber : C.starEmpty,
              transition: "color 0.12s, transform 0.12s",
              transform: active >= i ? "scale(1.15)" : "scale(1)",
            }}
          >
            ★
          </button>
        ))}
        {active > 0 && (
          <span style={{ fontSize: 13, color: C.muted, marginLeft: 4, fontWeight: 500 }}>
            {labels[active - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── WriteReviewModal ────────────────────────────────────────────────────── */
export default function WriteReviewModal({ isOpen, onClose, items, onResult }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  
  const { data: myReviews } = useMyReviews(isOpen);
  const { mutate: submitReview, isPending: isSubmitting } = useSubmitReview();
  const { mutate: editReview, isPending: isEditing } = useEditReview();

  const item = items[selectedIdx];

  // Check if an existing review exists for the selected item
  const existingReview = myReviews?.find(
    (rev) =>
      rev.product_id === item?.product_id &&
      (rev.order_item_id === item?.order_item_id || !item?.order_item_id)
  );

  /* Reset form or pre-populate when modal opens or selected item changes */
  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        setRating(existingReview.rating);
        setTitle(existingReview.title || "");
        setBody(existingReview.body || "");
      } else {
        setRating(0);
        setTitle("");
        setBody("");
      }
    }
  }, [isOpen, selectedIdx, existingReview]);

  if (!isOpen || items.length === 0) return null;

  const isPending = isSubmitting || isEditing;

  const handleSubmit = () => {
    if (!item || rating === 0) return;

    if (existingReview) {
      editReview(
        {
          reviewUuid: existingReview.uuid,
          payload: {
            rating,
            title: title.trim() || undefined,
            body: body.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            onResult("🎉 Review updated successfully!", "success");
            onClose();
          },
          onError: (err: any) => {
            let errMsg = "Could not update review. Please try again.";
            const detail = err?.response?.data?.detail;
            if (typeof detail === "string") {
              errMsg = detail;
            } else if (Array.isArray(detail)) {
              errMsg = detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
            } else if (detail && typeof detail === "object") {
              errMsg = detail.message || JSON.stringify(detail);
            }
            onResult(errMsg, "error");
          },
        }
      );
    } else {
      submitReview(
        {
          product_id: item.product_id,
          order_item_id: item.order_item_id,
          rating,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
        },
        {
          onSuccess: () => {
            onResult("🎉 Review submitted! It will appear after moderation.", "success");
            onClose();
          },
          onError: (err: any) => {
            let errMsg = "Could not submit review. Please try again.";
            const detail = err?.response?.data?.detail;
            if (typeof detail === "string") {
              errMsg = detail;
            } else if (Array.isArray(detail)) {
              errMsg = detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
            } else if (detail && typeof detail === "object") {
              errMsg = detail.message || JSON.stringify(detail);
            }
            onResult(errMsg, "error");
          },
        }
      );
    }
  };

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1200,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Write a review"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 18, padding: "28px 28px 24px",
          width: "100%", maxWidth: 500,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          fontFamily: "'Outfit', 'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C.heading }}>⭐ Rate Your Purchase</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 20, color: C.muted, lineHeight: 1, padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Product selector — only if multiple items */}
        {items.length > 1 && (
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 8 }}>
              Select a product to review
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto" }}>
              {items.map((it, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setSelectedIdx(idx); setRating(0); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "9px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    border: `1.5px solid ${selectedIdx === idx ? C.green : C.border}`,
                    background: selectedIdx === idx ? C.greenPale : "transparent",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  {it.image_url
                    ? <img src={it.image_url} alt={it.title} style={{ width: 38, height: 38, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 38, height: 38, borderRadius: 7, background: C.bgMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🌿</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.heading, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title}</div>
                    {it.variant_title && <div style={{ fontSize: 11, color: C.muted }}>{it.variant_title}</div>}
                  </div>
                  {selectedIdx === idx && <span style={{ color: C.green, fontSize: 15, fontWeight: 800, flexShrink: 0 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Single-item chip */}
        {items.length === 1 && item && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 18,
            padding: "10px 14px", background: C.bg, borderRadius: 10,
            border: `1px solid ${C.border}`,
          }}>
            {item.image_url
              ? <img src={item.image_url} alt={item.title} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
              : <div style={{ width: 44, height: 44, borderRadius: 8, background: C.bgMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🌿</div>
            }
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.heading }}>{item.title}</div>
              {item.variant_title && <div style={{ fontSize: 12, color: C.muted }}>{item.variant_title}</div>}
            </div>
          </div>
        )}

        {/* Star rating */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 8 }}>
            Rating <span style={{ color: C.red }}>*</span>
          </p>
          <StarPicker value={rating} onChange={setRating} />
          {rating === 0 && (
            <p style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>Tap a star to rate</p>
          )}
        </div>

        {/* Review title */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>
            Review Title <span style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your experience…"
            maxLength={120}
            style={{
              width: "100%", padding: "10px 13px", borderRadius: 9,
              border: `1.5px solid ${C.border}`, fontSize: 14, color: C.body,
              fontFamily: "inherit", outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.green)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
          />
        </div>

        {/* Review body */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>
            Your Review <span style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell others what you liked or didn't like about this plant…"
            rows={3}
            maxLength={2000}
            style={{
              width: "100%", padding: "10px 13px", borderRadius: 9,
              border: `1.5px solid ${C.border}`, fontSize: 13, resize: "vertical",
              color: C.body, fontFamily: "inherit", outline: "none",
              boxSizing: "border-box", transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.green)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
          />
          <div style={{ textAlign: "right", fontSize: 11, color: C.muted, marginTop: 3 }}>
            {body.length}/2000
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            id="btn-review-modal-close"
            onClick={onClose}
            style={{
              padding: "11px 22px", borderRadius: 9,
              border: `1.5px solid ${C.border}`,
              background: "transparent", fontWeight: 600, fontSize: 14,
              cursor: "pointer", color: C.body, fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            id="btn-review-submit"
            disabled={rating === 0 || isPending}
            onClick={handleSubmit}
            style={{
              padding: "11px 24px", borderRadius: 9, border: "none",
              background: rating === 0 || isPending ? "#e5e7eb" : C.green,
              color: rating === 0 || isPending ? C.muted : "#fff",
              fontWeight: 700, fontSize: 14, fontFamily: "inherit",
              cursor: rating === 0 || isPending ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              boxShadow: rating > 0 && !isPending ? "0 4px 14px rgba(0,181,102,0.30)" : "none",
            }}
          >
            {isPending ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
