import { useQuery } from "@tanstack/react-query";
import { getProductReviewsApi, ProductReviewFilters } from "../api/reviews.api";

export function useProductReviews(productId?: number, filters: ProductReviewFilters = {}) {
  return useQuery({
    queryKey: ["product-reviews", productId, filters],
    queryFn: () => getProductReviewsApi(productId!, filters),
    enabled: !!productId && productId > 0,
  });
}
