import { useQuery } from "@tanstack/react-query";
import { getMyReviewsApi } from "../api/reviews.api";

export function useMyReviews(enabled: boolean = true) {
  return useQuery({
    queryKey: ["my-reviews"],
    queryFn: getMyReviewsApi,
    enabled,
  });
}
