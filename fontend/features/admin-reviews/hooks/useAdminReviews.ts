import { useQuery } from "@tanstack/react-query";
import { listAdminReviewsApi, getAdminReviewStatsApi, getAdminReviewDetailApi, AdminReviewFilters } from "../api/admin-reviews.api";

export function useAdminReviews(filters: AdminReviewFilters = {}) {
  return useQuery({
    queryKey: ["admin-reviews", filters],
    queryFn: () => listAdminReviewsApi(filters),
  });
}

export function useAdminReviewStats() {
  return useQuery({
    queryKey: ["admin-review-stats"],
    queryFn: getAdminReviewStatsApi,
  });
}

export function useAdminReviewDetail(uuid?: string) {
  return useQuery({
    queryKey: ["admin-review-detail", uuid],
    queryFn: () => getAdminReviewDetailApi(uuid!),
    enabled: !!uuid,
  });
}
