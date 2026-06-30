// ─── Types ────────────────────────────────────────────────────────────────────

export type DiscountStatus = "active" | "scheduled" | "expired" | "draft";
export type DiscountType = "percentage" | "fixed" | "shipping" | "bogo";
export type DiscountMethod = "code" | "automatic";

export interface Discount {
  id: string;
  code: string;               // discount code (for method=code) or title (for method=automatic)
  title: string;              // human-readable title/description
  type: DiscountType;
  method: DiscountMethod;
  value: number;              // percentage (1-100) or fixed amount (₹)
  valueCap?: number;          // max cap for % discounts
  status: DiscountStatus;
  usedCount: number;
  usageLimit?: number;        // undefined = unlimited
  minOrderAmount?: number;    // ₹ minimum
  minQuantity?: number;       // item count minimum
  startDate: string;          // ISO date string
  endDate?: string;           // undefined = no end date
  appliesTo: "all" | "collections" | "products" | "customers";
  collections?: string[];
  products?: string[];
  customerEligibility: "all" | "segments" | "specific" | "tiers";
  firstTimeOnly: boolean;
  combinesWithProduct: boolean;
  combinesWithOrder: boolean;
  combinesWithShipping: boolean;
  createdAt: string;
  createdBy: string;
  // BOGO fields
  bogoConfig?: {
    buyQty: number;
    buyScope: "any" | "collection" | "product";
    buyTarget?: string;
    getQty: number;
    getScope: "collection" | "product";
    getTarget?: string;
    getDiscount: "100" | "50" | "fixed";
    getFixedPrice?: number;
    limitOncePerOrder: boolean;
  };
  // Usage stats (for edit mode)
  totalDiscountGiven?: number;
  ordersUsing?: number;
  avgOrderValue?: number;
  revenueGenerated?: number;
  usageTrend?: number[];     // 30-day daily usage counts
}

export interface KPIStat {
  label: string;
  value: string;
  rawValue: number;
  type: "normal" | "danger" | "warning";
  filterKey: DiscountStatus | "expiring";
}

// ─── KPI Data ─────────────────────────────────────────────────────────────────

export const KPI_DATA: KPIStat[] = [
  { label: "Active Discounts",      value: "24",        rawValue: 24,       type: "normal",  filterKey: "active" },
  { label: "Codes Used (30d)",      value: "1,842",     rawValue: 1842,     type: "normal",  filterKey: "active" },
  { label: "Revenue from Discounts",value: "₹2,48,310", rawValue: 248310,   type: "normal",  filterKey: "active" },
  { label: "Discount Cost (30d)",   value: "₹38,420",   rawValue: 38420,    type: "danger",  filterKey: "active" },
  { label: "Expiring Soon (7 days)",value: "6",         rawValue: 6,        type: "warning", filterKey: "expiring" },
];

// ─── Mock Discounts ───────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export const MOCK_DISCOUNTS: Discount[] = [
  {
    id: "dsc-001", code: "HERO20", title: "Flat 20% off — Summer Sale",
    type: "percentage", method: "code", value: 20, valueCap: 500,
    status: "active", usedCount: 24, usageLimit: 100,
    minOrderAmount: 500, startDate: daysAgo(10), endDate: daysFromNow(20),
    appliesTo: "all", customerEligibility: "all", firstTimeOnly: false,
    combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: true,
    createdAt: daysAgo(12), createdBy: "Priya K.",
    totalDiscountGiven: 4840, ordersUsing: 24, avgOrderValue: 1102, revenueGenerated: 26448,
    usageTrend: [0,1,2,1,3,2,1,0,2,3,2,1,1,2,3,4,2,1,2,3,2,1,0,1,2,3,2,1,2,3],
  },
  {
    id: "dsc-002", code: "WELCOME15", title: "Welcome — 15% off first order",
    type: "percentage", method: "code", value: 15,
    status: "active", usedCount: 312, usageLimit: undefined,
    startDate: daysAgo(90), appliesTo: "all", customerEligibility: "all",
    firstTimeOnly: true, combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: false,
    createdAt: daysAgo(92), createdBy: "Admin",
    totalDiscountGiven: 24800, ordersUsing: 312, avgOrderValue: 980, revenueGenerated: 305760,
    usageTrend: [8,10,9,12,11,8,7,9,10,11,12,10,9,8,11,13,10,9,8,10,11,9,8,10,12,11,9,8,10,12],
  },
  {
    id: "dsc-003", code: "FLAT100", title: "₹100 off orders over ₹599",
    type: "fixed", method: "code", value: 100,
    status: "active", usedCount: 87, usageLimit: 200,
    minOrderAmount: 599, startDate: daysAgo(5), endDate: daysFromNow(25),
    appliesTo: "all", customerEligibility: "all", firstTimeOnly: false,
    combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: false,
    createdAt: daysAgo(6), createdBy: "Rohan M.",
  },
  {
    id: "dsc-004", code: "Free Shipping Over ₹499", title: "Free Shipping Over ₹499",
    type: "shipping", method: "automatic", value: 0,
    status: "active", usedCount: 548,
    minOrderAmount: 499, startDate: daysAgo(60),
    appliesTo: "all", customerEligibility: "all", firstTimeOnly: false,
    combinesWithProduct: true, combinesWithOrder: true, combinesWithShipping: false,
    createdAt: daysAgo(62), createdBy: "Admin",
  },
  {
    id: "dsc-005", code: "BUYMORE", title: "Buy 2 Get 1 Free — Indoor Plants",
    type: "bogo", method: "code", value: 0,
    status: "active", usedCount: 18,
    startDate: daysAgo(3), endDate: daysFromNow(27),
    appliesTo: "collections", collections: ["Indoor Plants"],
    customerEligibility: "all", firstTimeOnly: false,
    combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: true,
    createdAt: daysAgo(4), createdBy: "Priya K.",
    bogoConfig: {
      buyQty: 2, buyScope: "collection", buyTarget: "Indoor Plants",
      getQty: 1, getScope: "collection", getTarget: "Indoor Plants",
      getDiscount: "100", limitOncePerOrder: true,
    },
  },
  {
    id: "dsc-006", code: "GOLD10", title: "Gold Member — 10% exclusive",
    type: "percentage", method: "code", value: 10,
    status: "active", usedCount: 44,
    startDate: daysAgo(30),
    appliesTo: "all", customerEligibility: "tiers", firstTimeOnly: false,
    combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: true,
    createdAt: daysAgo(31), createdBy: "Priya K.",
  },
  {
    id: "dsc-007", code: "MONSALE", title: "Monsoon Sale — 30% off",
    type: "percentage", method: "code", value: 30, valueCap: 1000,
    status: "scheduled", usedCount: 0, usageLimit: 500,
    startDate: daysFromNow(3), endDate: daysFromNow(10),
    appliesTo: "all", customerEligibility: "all", firstTimeOnly: false,
    combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: false,
    createdAt: daysAgo(2), createdBy: "Priya K.",
  },
  {
    id: "dsc-008", code: "SILVER5", title: "Silver member loyalty — ₹50 off",
    type: "fixed", method: "code", value: 50,
    status: "scheduled", usedCount: 0,
    startDate: daysFromNow(5),
    appliesTo: "all", customerEligibility: "tiers", firstTimeOnly: false,
    combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: false,
    createdAt: daysAgo(1), createdBy: "Admin",
  },
  {
    id: "dsc-009", code: "DIWALI25", title: "Diwali Special — 25% off",
    type: "percentage", method: "code", value: 25,
    status: "expired", usedCount: 1240, usageLimit: 1500,
    minOrderAmount: 999, startDate: daysAgo(240), endDate: daysAgo(200),
    appliesTo: "all", customerEligibility: "all", firstTimeOnly: false,
    combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: false,
    createdAt: daysAgo(242), createdBy: "Priya K.",
    totalDiscountGiven: 186000, ordersUsing: 1240, avgOrderValue: 1380, revenueGenerated: 1711200,
    usageTrend: [0,5,12,18,24,32,48,45,38,30,25,20,15,12,8,5,3,2,1,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: "dsc-010", code: "HOLI20", title: "Holi Festival — 20% all products",
    type: "percentage", method: "code", value: 20,
    status: "expired", usedCount: 876,
    startDate: daysAgo(120), endDate: daysAgo(115),
    appliesTo: "all", customerEligibility: "all", firstTimeOnly: false,
    combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: false,
    createdAt: daysAgo(122), createdBy: "Admin",
  },
  {
    id: "dsc-011", code: "NEWAPP25", title: "New App Users — 25% off",
    type: "percentage", method: "code", value: 25,
    status: "draft", usedCount: 0,
    startDate: daysFromNow(7),
    appliesTo: "all", customerEligibility: "all", firstTimeOnly: true,
    combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: false,
    createdAt: daysAgo(1), createdBy: "Rohan M.",
  },
  {
    id: "dsc-012", code: "REFER200", title: "Referral Bonus — ₹200 off",
    type: "fixed", method: "code", value: 200,
    status: "draft", usedCount: 0,
    minOrderAmount: 800, startDate: daysFromNow(14),
    appliesTo: "all", customerEligibility: "specific", firstTimeOnly: false,
    combinesWithProduct: false, combinesWithOrder: false, combinesWithShipping: false,
    createdAt: daysAgo(0), createdBy: "Admin",
  },
];

// ─── Segment counts (for tabs) ────────────────────────────────────────────────

export function countByStatus(discounts: Discount[]) {
  return {
    all: discounts.length,
    active: discounts.filter(d => d.status === "active").length,
    scheduled: discounts.filter(d => d.status === "scheduled").length,
    expired: discounts.filter(d => d.status === "expired").length,
    draft: discounts.filter(d => d.status === "draft").length,
  };
}
