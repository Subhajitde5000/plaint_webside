import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submitReviewApi,
  editReviewApi,
  deleteReviewApi,
  voteHelpfulApi,
  reportReviewApi,
  SubmitReviewPayload,
  EditReviewPayload,
} from "../api/reviews.api";

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) => submitReviewApi(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

export function useEditReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewUuid, payload }: { reviewUuid: string; payload: EditReviewPayload }) =>
      editReviewApi(reviewUuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewUuid: string) => deleteReviewApi(reviewUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

export function useVoteHelpful() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, helpful }: { reviewId: number; helpful: boolean }) =>
      voteHelpfulApi(reviewId, helpful),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

export function useReportReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reason, notes }: { reviewId: number; reason: string; notes?: string }) =>
      reportReviewApi(reviewId, reason, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
    },
  });
}
