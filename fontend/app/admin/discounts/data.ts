export type DiscountStatus = "active" | "scheduled" | "paused" | "expired" | "draft" | "archived";
export type DiscountType = "percentage" | "fixed" | "shipping" | "bogo";
export type DiscountMethod = "code" | "automatic";

export interface Discount {
  id: string; code: string; title: string; type: DiscountType; method: DiscountMethod; value: number;
  valueCap?: number; status: DiscountStatus; usedCount: number; usageLimit?: number;
  minOrderAmount?: number; minQuantity?: number; startDate: string; endDate?: string;
  appliesTo: "all" | "collections" | "products" | "customers";
  customerEligibility: "all" | "segments" | "specific" | "tiers";
  firstTimeOnly: boolean; combinesWithProduct: boolean; combinesWithOrder: boolean; combinesWithShipping: boolean;
  createdAt: string; createdBy: string; totalDiscountGiven?: number; ordersUsing?: number; avgOrderValue?: number; revenueGenerated?: number;
}

export function countByStatus(discounts: Discount[]) {
  return { all: discounts.length, active: discounts.filter((discount) => discount.status === "active").length,
    scheduled: discounts.filter((discount) => discount.status === "scheduled").length,
    paused: discounts.filter((discount) => discount.status === "paused").length,
    expired: discounts.filter((discount) => discount.status === "expired").length,
    draft: discounts.filter((discount) => discount.status === "draft").length };
}
