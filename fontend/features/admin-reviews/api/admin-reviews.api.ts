import { api } from "@/lib/axios";

export interface AdminReviewStats {
  total_reviews: number;
  pending_reviews: number;
  approved_reviews: number;
  rejected_reviews: number;
  hidden_reviews: number;
  reported_reviews: number;
  average_rating: number;
  reviews_today: number;
  photo_reviews: number;
  video_reviews: number;
}

export interface AdminReviewListItem {
  id: number;
  uuid: string;
  customer_name: string;
  customer_email?: string;
  user_id?: number;
  product_id: number;
  product_name: string;
  order_id?: number;
  order_number?: string;
  rating: number;
  title?: string;
  body?: string;
  video_url?: string;
  photo_count: number;
  is_verified_purchase: boolean;
  is_featured: boolean;
  status: "pending" | "published" | "rejected" | "hidden" | "flagged";
  spam_score: number;
  ai_risk_level: string;
  helpful_count: number;
  flag_count: number;
  admin_reply?: string;
  created_at: string;
}

export interface AdminReviewReportItem {
  id: number;
  reason: string;
  reporter: string;
  notes?: string;
  created_at: string;
}

export interface AdminReviewHistoryItem {
  id: number;
  action: string;
  notes?: string;
  admin_name?: string;
  created_at: string;
}

export interface AdminReviewDetail {
  id: number;
  uuid: string;
  customer_id?: number;
  customer_name: string;
  customer_email?: string;
  product_id: number;
  product_name: string;
  product_slug: string;
  order_id?: number;
  order_number?: string;
  rating: number;
  title?: string;
  body?: string;
  video_url?: string;
  photos: { id: number; url: string; position: number }[];
  is_verified_purchase: boolean;
  is_featured: boolean;
  is_edited: boolean;
  status: "pending" | "published" | "rejected" | "hidden" | "flagged";
  spam_score: number;
  ai_risk_level: string;
  helpful_count: number;
  not_helpful_count: number;
  flag_count: number;
  admin_reply?: string;
  admin_reply_at?: string;
  admin_reply_by?: string;
  rejection_reason?: string;
  reports: AdminReviewReportItem[];
  history: AdminReviewHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface AdminReviewFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  rating?: number;
  verifiedPurchase?: boolean;
  hasPhoto?: boolean;
  hasVideo?: boolean;
  q?: string;
  sort?: string;
}

/** GET /admin/reviews/stats */
export const getAdminReviewStatsApi = async (): Promise<AdminReviewStats> => {
  const res = await api.get("/admin/reviews/stats");
  return res.data;
};

/** GET /admin/reviews/ */
export const listAdminReviewsApi = async (
  filters: AdminReviewFilters = {}
): Promise<{ items: AdminReviewListItem[]; total: number; page: number; page_size: number; pages: number }> => {
  const res = await api.get("/admin/reviews/", {
    params: {
      page: filters.page ?? 1,
      page_size: filters.pageSize ?? 25,
      status: filters.status,
      rating: filters.rating,
      verified_purchase: filters.verifiedPurchase,
      has_photo: filters.hasPhoto,
      has_video: filters.hasVideo,
      q: filters.q,
      sort: filters.sort ?? "newest",
    },
  });
  return res.data;
};

/** GET /admin/reviews/{uuid} */
export const getAdminReviewDetailApi = async (uuid: string): Promise<AdminReviewDetail> => {
  const res = await api.get(`/admin/reviews/${uuid}`);
  return res.data;
};

/** POST /admin/reviews/{uuid}/approve */
export const approveReviewApi = async (uuid: string): Promise<{ message: string }> => {
  const res = await api.post(`/admin/reviews/${uuid}/approve`);
  return res.data;
};

/** POST /admin/reviews/{uuid}/reject */
export const rejectReviewApi = async (uuid: string, reason: string): Promise<{ message: string }> => {
  const res = await api.post(`/admin/reviews/${uuid}/reject`, { reason });
  return res.data;
};

/** POST /admin/reviews/{uuid}/hide */
export const hideReviewApi = async (uuid: string): Promise<{ message: string }> => {
  const res = await api.post(`/admin/reviews/${uuid}/hide`);
  return res.data;
};

/** POST /admin/reviews/{uuid}/restore */
export const restoreReviewApi = async (uuid: string): Promise<{ message: string }> => {
  const res = await api.post(`/admin/reviews/${uuid}/restore`);
  return res.data;
};

/** POST /admin/reviews/{uuid}/pin */
export const togglePinReviewApi = async (uuid: string): Promise<{ message: string; is_featured: boolean }> => {
  const res = await api.post(`/admin/reviews/${uuid}/pin`);
  return res.data;
};

/** POST /admin/reviews/{uuid}/reply */
export const replyToReviewApi = async (uuid: string, reply: string): Promise<{ message: string }> => {
  const res = await api.post(`/admin/reviews/${uuid}/reply`, { reply });
  return res.data;
};

/** DELETE /admin/reviews/{uuid}/media/{photoId} */
export const deleteReviewMediaApi = async (uuid: string, photoId: number): Promise<{ message: string }> => {
  const res = await api.delete(`/admin/reviews/${uuid}/media/${photoId}`);
  return res.data;
};

/** DELETE /admin/reviews/{uuid} */
export const deleteReviewAdminApi = async (uuid: string): Promise<void> => {
  await api.delete(`/admin/reviews/${uuid}`);
};
