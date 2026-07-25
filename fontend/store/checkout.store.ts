import { create } from "zustand";

export interface BuyNowItem {
  product_uuid?: string;
  variant_id: number;
  variant_uuid?: string;
  product_title: string;
  variant_title?: string;
  price: number;
  quantity: number;
  image_url?: string;
  options?: string;
}

export interface DiscountMeta {
  code: string;
  discount_type: "percentage" | "fixed";
  value: number;
}

interface CheckoutState {
  buyNowItem: BuyNowItem | null;
  discountCode: string | null;
  discountMeta: DiscountMeta | null;
  loyaltyPointsToUse: number;
  loyaltyDiscountAmount: number;
  setBuyNowItem: (item: BuyNowItem) => void;
  clearBuyNowItem: () => void;
  setDiscountCode: (code: string | null) => void;
  setDiscountMeta: (meta: DiscountMeta | null) => void;
  setLoyaltyPointsToUse: (pts: number, discount?: number) => void;
  clearLoyaltyPoints: () => void;
}

const BUY_NOW_KEY = "plant_byst_buy_now_item";
const DISCOUNT_CODE_KEY = "plant_byst_discount_code";
const DISCOUNT_META_KEY = "plant_byst_discount_meta";

function ssGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

function ssSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function ssDel(key: string) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.removeItem(key); } catch {}
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  buyNowItem: ssGet<BuyNowItem>(BUY_NOW_KEY),
  discountCode: ssGet<string>(DISCOUNT_CODE_KEY),
  discountMeta: ssGet<DiscountMeta>(DISCOUNT_META_KEY),
  loyaltyPointsToUse: 0,
  loyaltyDiscountAmount: 0,

  setBuyNowItem: (item) => {
    ssSet(BUY_NOW_KEY, item);
    set({ buyNowItem: item });
  },
  clearBuyNowItem: () => {
    ssDel(BUY_NOW_KEY);
    set({ buyNowItem: null });
  },
  setDiscountCode: (code) => {
    if (code) ssSet(DISCOUNT_CODE_KEY, code);
    else ssDel(DISCOUNT_CODE_KEY);
    set({ discountCode: code });
  },
  setDiscountMeta: (meta) => {
    if (meta) ssSet(DISCOUNT_META_KEY, meta);
    else ssDel(DISCOUNT_META_KEY);
    set({ discountMeta: meta });
  },
  setLoyaltyPointsToUse: (pts: number, discount: number = 0) => {
    set({ loyaltyPointsToUse: pts, loyaltyDiscountAmount: discount });
  },
  clearLoyaltyPoints: () => {
    set({ loyaltyPointsToUse: 0, loyaltyDiscountAmount: 0 });
  },
}));

