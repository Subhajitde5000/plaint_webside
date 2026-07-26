import { api } from "@/lib/axios";

export interface ReviewPhoto {
  id?: number;
  url: string;
  position?: number;
}

export interface ReviewItem {
  id: number;
  uuid: string;
  product_id: number;
  user_id?: number;
  order_item_id?: number;
  reviewer_name: string;
  reviewer_email?: string;
  rating: number;
  title?: string;
  body?: string;
  video_url?: string;
  is_verified_purchase: boolean;
  is_featured: boolean;
  is_edited: boolean;
  edited_at?: string;
  status: string;
  admin_reply?: string;
  admin_reply_at?: string;
  helpful_count: number;
  not_helpful_count: number;
  user_voted_helpful?: boolean | null;
  created_at: string;
  photos: ReviewPhoto[];
}

export interface RatingDistribution {
  average: number;
  total_reviews: number;
  star_5: number;
  star_4: number;
  star_3: number;
  star_2: number;
  star_1: number;
  photo_count: number;
  video_count: number;
  verified_count: number;
}

export interface ProductReviewsResponse {
  items: ReviewItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  distribution: RatingDistribution;
}

export interface ProductReviewFilters {
  page?: number;
  pageSize?: number;
  rating?: number;
  withImages?: boolean;
  withVideo?: boolean;
  verifiedOnly?: boolean;
  sort?: "newest" | "helpful" | "highest_rating" | "lowest_rating";
}

export interface SubmitReviewPayload {
  product_id: number;
  order_item_id?: number;
  reviewer_name?: string;
  reviewer_email?: string;
  rating: number;
  title?: string;
  body?: string;
  photos?: string[];
  video_url?: string;
}

export interface EditReviewPayload {
  rating?: number;
  title?: string;
  body?: string;
  photos?: string[];
  video_url?: string;
}

export interface MyReviewProductInfo {
  id: number;
  title: string;
  slug: string;
  image_url?: string;
}

export interface MyReviewItem {
  id: number;
  uuid: string;
  product_id: number;
  product?: MyReviewProductInfo;
  order_number?: string;
  rating: number;
  title?: string;
  body?: string;
  video_url?: string;
  photos: ReviewPhoto[];
  status: "pending" | "published" | "rejected" | "hidden" | "flagged";
  is_verified_purchase: boolean;
  is_edited: boolean;
  edited_at?: string;
  helpful_count: number;
  admin_reply?: string;
  admin_reply_at?: string;
  created_at: string;
  can_edit: boolean;
  days_left_to_edit: number;
  order_item_id?: number;
}

/** GET /reviews/product/{product_id} */
export const getProductReviewsApi = async (
  productId: number,
  filters: ProductReviewFilters = {}
): Promise<ProductReviewsResponse> => {
  const res = await api.get(`/reviews/product/${productId}`, {
    params: {
      page: filters.page ?? 1,
      page_size: filters.pageSize ?? 10,
      rating: filters.rating,
      with_images: filters.withImages,
      with_video: filters.withVideo,
      verified_only: filters.verifiedOnly,
      sort: filters.sort ?? "newest",
    },
  });
  return res.data;
};

/** GET /reviews/my */
export const getMyReviewsApi = async (): Promise<MyReviewItem[]> => {
  const res = await api.get("/reviews/my");
  return res.data;
};

/** POST /reviews/ */
export const submitReviewApi = async (
  payload: SubmitReviewPayload
): Promise<{ message: string; review_uuid: string; status: string }> => {
  const res = await api.post("/reviews/", payload);
  return res.data;
};

/** PATCH /reviews/{review_uuid} */
export const editReviewApi = async (
  reviewUuid: string,
  payload: EditReviewPayload
): Promise<{ message: string; review_uuid: string }> => {
  const res = await api.patch(`/reviews/${reviewUuid}`, payload);
  return res.data;
};

/** DELETE /reviews/{review_uuid} */
export const deleteReviewApi = async (reviewUuid: string): Promise<{ message: string }> => {
  const res = await api.delete(`/reviews/${reviewUuid}`);
  return res.data;
};

/** POST /reviews/{review_id}/helpful */
export const voteHelpfulApi = async (
  reviewId: number,
  helpful: boolean
): Promise<{ message: string; helpful_count: number; not_helpful_count: number }> => {
  const res = await api.post(`/reviews/${reviewId}/helpful`, { helpful });
  return res.data;
};

/** POST /reviews/{review_id}/report */
export const reportReviewApi = async (
  reviewId: number,
  reason: string,
  notes?: string
): Promise<{ message: string }> => {
  const res = await api.post(`/reviews/${reviewId}/report`, { reason, notes });
  return res.data;
};
