import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/admin-discounts.api";

export function useAdminDiscounts(filters: api.AdminDiscountFilters = {}) { return useQuery({ queryKey: ["admin-discounts", filters], queryFn: () => api.getAdminDiscountsApi(filters), staleTime: 30_000 }); }
export function useAdminDiscount(uuid?: string) { return useQuery({ queryKey: ["admin-discount", uuid], queryFn: () => api.getAdminDiscountApi(uuid!), enabled: Boolean(uuid) }); }
function invalidate(queryClient: ReturnType<typeof useQueryClient>, uuid?: string) { queryClient.invalidateQueries({ queryKey: ["admin-discounts"] }); if (uuid) queryClient.invalidateQueries({ queryKey: ["admin-discount", uuid] }); }
export function useCreateDiscount() { const qc = useQueryClient(); return useMutation({ mutationFn: api.createDiscountApi, onSuccess: () => invalidate(qc) }); }
export function useUpdateDiscount(uuid: string) { const qc = useQueryClient(); return useMutation({ mutationFn: (data: Partial<api.DiscountPayload>) => api.updateDiscountApi(uuid, data), onSuccess: () => invalidate(qc, uuid) }); }
export function useDeleteDiscount() { const qc = useQueryClient(); return useMutation({ mutationFn: api.deleteDiscountApi, onSuccess: () => invalidate(qc) }); }
export function useActivateDiscount() { const qc = useQueryClient(); return useMutation({ mutationFn: api.activateDiscountApi, onSuccess: (_data, uuid) => invalidate(qc, uuid) }); }
export function useDeactivateDiscount() { const qc = useQueryClient(); return useMutation({ mutationFn: api.deactivateDiscountApi, onSuccess: (_data, uuid) => invalidate(qc, uuid) }); }
export function useDuplicateDiscount() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ uuid, newCode }: { uuid: string; newCode: string }) => api.duplicateDiscountApi(uuid, newCode), onSuccess: () => invalidate(qc) }); }
export function useDiscountReport(uuid?: string) { return useQuery({ queryKey: ["admin-discount-report", uuid], queryFn: () => api.getDiscountReportApi(uuid!), enabled: Boolean(uuid), staleTime: 300_000 }); }
