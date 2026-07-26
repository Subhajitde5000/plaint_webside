import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveReviewApi,
  rejectReviewApi,
  hideReviewApi,
  restoreReviewApi,
  togglePinReviewApi,
  replyToReviewApi,
  deleteReviewMediaApi,
  deleteReviewAdminApi,
} from "../api/admin-reviews.api";

export function useAdminReviewActions() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    queryClient.invalidateQueries({ queryKey: ["admin-review-stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin-review-detail"] });
  };

  const approveMutation = useMutation({
    mutationFn: (uuid: string) => approveReviewApi(uuid),
    onSuccess: invalidateAll,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason: string }) => rejectReviewApi(uuid, reason),
    onSuccess: invalidateAll,
  });

  const hideMutation = useMutation({
    mutationFn: (uuid: string) => hideReviewApi(uuid),
    onSuccess: invalidateAll,
  });

  const restoreMutation = useMutation({
    mutationFn: (uuid: string) => restoreReviewApi(uuid),
    onSuccess: invalidateAll,
  });

  const pinMutation = useMutation({
    mutationFn: (uuid: string) => togglePinReviewApi(uuid),
    onSuccess: invalidateAll,
  });

  const replyMutation = useMutation({
    mutationFn: ({ uuid, reply }: { uuid: string; reply: string }) => replyToReviewApi(uuid, reply),
    onSuccess: invalidateAll,
  });

  const deleteMediaMutation = useMutation({
    mutationFn: ({ uuid, photoId }: { uuid: string; photoId: number }) => deleteReviewMediaApi(uuid, photoId),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => deleteReviewAdminApi(uuid),
    onSuccess: invalidateAll,
  });

  return {
    approve: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    reject: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
    hide: hideMutation.mutateAsync,
    isHiding: hideMutation.isPending,
    restore: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    pin: pinMutation.mutateAsync,
    isPinning: pinMutation.isPending,
    reply: replyMutation.mutateAsync,
    isReplying: replyMutation.isPending,
    deleteMedia: deleteMediaMutation.mutateAsync,
    isDeletingMedia: deleteMediaMutation.isPending,
    deleteReview: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
