import { adminApi } from "@/lib/admin-axios";

export type DiscountStatus = "draft" | "scheduled" | "active" | "paused" | "expired" | "archived";
export type DiscountType = "percentage" | "fixed_amount" | "free_shipping" | "bogo";

export interface DiscountPayload {
  code?: string;
  title: string;
  method: "code" | "automatic";
  discountType: DiscountType;
  value?: number;
  maxDiscountAmount?: number;
  appliesTo?: "all" | "specific_collections" | "specific_products" | "specific_customers";
  excludeSaleItems?: boolean;
  customerEligibility?: "all" | "specific_customers" | "specific_segments" | "loyalty_tier" | "first_time";
  minLoyaltyTier?: "plant_lover" | "silver" | "gold";
  firstTimeOnly?: boolean;
  minRequirementType?: "none" | "amount" | "quantity";
  minRequirementValue?: number;
  usageLimitTotal?: number;
  usageLimitPerCustomer?: number;
  combineWithProduct?: boolean;
  combineWithOrder?: boolean;
  combineWithShipping?: boolean;
  startsAt: string;
  endsAt?: string;
  status?: DiscountStatus;
}

export interface AdminDiscount {
  id: number; uuid: string; code?: string | null; title: string; method: "code" | "automatic"; discount_type: DiscountType;
  value?: number | null; max_discount_amount?: number | null; applies_to: "all" | "specific_collections" | "specific_products" | "specific_customers";
  customer_eligibility: "all" | "specific_customers" | "specific_segments" | "loyalty_tier" | "first_time";
  min_requirement_type: "none" | "amount" | "quantity"; min_requirement_value?: number | null; usage_count: number; usage_limit_total?: number | null;
  usage_limit_per_customer: number; exclude_sale_items: boolean; first_time_only: boolean; combine_with_product: boolean; combine_with_order: boolean; combine_with_shipping: boolean;
  starts_at: string; ends_at?: string | null; created_at: string; status: DiscountStatus;
}

export interface AdminDiscountFilters { status?: string; discountType?: string; method?: string; q?: string; page?: number; pageSize?: number; sort?: string; }
export interface AdminDiscountListResponse { items: AdminDiscount[]; total: number; page: number; page_size: number; pages: number; }

const toSnakeCase = (data: Partial<DiscountPayload>) => ({
  code: data.code, title: data.title, method: data.method, discount_type: data.discountType,
  value: data.value, max_discount_amount: data.maxDiscountAmount, applies_to: data.appliesTo,
  exclude_sale_items: data.excludeSaleItems, customer_eligibility: data.customerEligibility,
  min_loyalty_tier: data.minLoyaltyTier, first_time_only: data.firstTimeOnly,
  min_requirement_type: data.minRequirementType, min_requirement_value: data.minRequirementValue,
  usage_limit_total: data.usageLimitTotal, usage_limit_per_customer: data.usageLimitPerCustomer,
  combine_with_product: data.combineWithProduct, combine_with_order: data.combineWithOrder,
  combine_with_shipping: data.combineWithShipping, starts_at: data.startsAt, ends_at: data.endsAt, status: data.status,
});

export async function getAdminDiscountsApi(filters: AdminDiscountFilters = {}): Promise<AdminDiscountListResponse> {
  return (await adminApi.get("/admin/discounts/", { params: { status: filters.status, discount_type: filters.discountType, method: filters.method, q: filters.q, page: filters.page ?? 1, page_size: filters.pageSize ?? 25, sort: filters.sort } })).data;
}
export async function getAdminDiscountApi(uuid: string): Promise<AdminDiscount> { return (await adminApi.get(`/admin/discounts/${uuid}`)).data; }
export async function createDiscountApi(data: DiscountPayload): Promise<AdminDiscount> { return (await adminApi.post("/admin/discounts/", toSnakeCase(data))).data; }
export async function updateDiscountApi(uuid: string, data: Partial<DiscountPayload>): Promise<AdminDiscount> { return (await adminApi.put(`/admin/discounts/${uuid}`, toSnakeCase(data))).data; }
export async function deleteDiscountApi(uuid: string) { return (await adminApi.delete(`/admin/discounts/${uuid}`)).data; }
export async function activateDiscountApi(uuid: string) { return (await adminApi.post(`/admin/discounts/${uuid}/activate`)).data; }
export async function deactivateDiscountApi(uuid: string) { return (await adminApi.post(`/admin/discounts/${uuid}/deactivate`)).data; }
export async function duplicateDiscountApi(uuid: string, newCode: string): Promise<AdminDiscount> { return (await adminApi.post(`/admin/discounts/${uuid}/duplicate`, { new_code: newCode })).data; }
export async function getDiscountReportApi(uuid: string) { return (await adminApi.get(`/admin/discounts/${uuid}/report`)).data; }
export async function checkDiscountCodeApi(code: string, excludeId?: string): Promise<{ available: boolean }> { return (await adminApi.get("/admin/discounts/check-code", { params: { code, exclude_id: excludeId } })).data; }
