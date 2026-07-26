from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class ReviewPhotoSchema(BaseModel):
    id: Optional[int] = None
    url: str
    position: int = 1

    model_config = {"from_attributes": True}


class RatingDistribution(BaseModel):
    average: float = 0.0
    total_reviews: int = 0
    star_5: int = 0
    star_4: int = 0
    star_3: int = 0
    star_2: int = 0
    star_1: int = 0
    photo_count: int = 0
    video_count: int = 0
    verified_count: int = 0


class ReviewSchema(BaseModel):
    id: int
    uuid: str
    product_id: int
    user_id: Optional[int] = None
    order_item_id: Optional[int] = None
    reviewer_name: str
    reviewer_email: Optional[str] = None
    rating: int
    title: Optional[str] = None
    body: Optional[str] = None
    video_url: Optional[str] = None
    is_verified_purchase: bool = False
    is_featured: bool = False
    is_edited: bool = False
    edited_at: Optional[datetime] = None
    status: str
    admin_reply: Optional[str] = None
    admin_reply_at: Optional[datetime] = None
    helpful_count: int = 0
    not_helpful_count: int = 0
    user_voted_helpful: Optional[bool] = None  # True, False, or None
    created_at: datetime
    photos: List[ReviewPhotoSchema] = []

    model_config = {"from_attributes": True}


class ProductReviewsResponse(BaseModel):
    items: List[ReviewSchema]
    total: int
    page: int
    page_size: int
    pages: int
    distribution: RatingDistribution


class SubmitReviewRequest(BaseModel):
    product_id: int
    order_item_id: Optional[int] = None
    reviewer_name: Optional[str] = None
    reviewer_email: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    body: Optional[str] = Field(None, max_length=5000)
    photos: List[str] = []
    video_url: Optional[str] = None


class EditReviewRequest(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    body: Optional[str] = Field(None, max_length=5000)
    photos: Optional[List[str]] = None
    video_url: Optional[str] = None


class ReviewHelpfulRequest(BaseModel):
    helpful: bool  # True = helpful, False = not helpful


class ReviewReportRequest(BaseModel):
    reason: str  # "spam", "fake_review", "offensive", "harassment", "wrong_product", "other"
    notes: Optional[str] = Field(None, max_length=500)


class MyReviewProductInfo(BaseModel):
    id: int
    title: str = ""
    slug: str = ""
    image_url: Optional[str] = None


class MyReviewItem(BaseModel):
    id: int
    uuid: str
    product_id: int
    product: Optional[MyReviewProductInfo] = None
    order_number: Optional[str] = None
    rating: int
    title: Optional[str] = None
    body: Optional[str] = None
    video_url: Optional[str] = None
    photos: List[ReviewPhotoSchema] = []
    status: str
    is_verified_purchase: bool
    is_edited: bool
    edited_at: Optional[datetime] = None
    helpful_count: int
    admin_reply: Optional[str] = None
    admin_reply_at: Optional[datetime] = None
    created_at: datetime
    can_edit: bool = False
    days_left_to_edit: int = 0
    order_item_id: Optional[int] = None


class AdminReviewListItem(BaseModel):
    id: int
    uuid: str
    customer_name: str
    customer_email: Optional[str] = None
    user_id: Optional[int] = None
    product_id: int
    product_name: str
    order_id: Optional[int] = None
    order_number: Optional[str] = None
    rating: int
    title: Optional[str] = None
    body: Optional[str] = None
    video_url: Optional[str] = None
    photo_count: int = 0
    is_verified_purchase: bool = False
    is_featured: bool = False
    status: str
    spam_score: int = 0
    ai_risk_level: str = "low"
    helpful_count: int = 0
    flag_count: int = 0
    admin_reply: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminReviewReportItem(BaseModel):
    id: int
    reason: str
    reporter: str
    notes: Optional[str] = None
    created_at: datetime


class AdminReviewHistoryItem(BaseModel):
    id: int
    action: str
    notes: Optional[str] = None
    admin_name: Optional[str] = None
    created_at: datetime


class AdminReviewDetail(BaseModel):
    id: int
    uuid: str
    customer_id: Optional[int] = None
    customer_name: str
    customer_email: Optional[str] = None
    product_id: int
    product_name: str
    product_slug: str
    order_id: Optional[int] = None
    order_number: Optional[str] = None
    rating: int
    title: Optional[str] = None
    body: Optional[str] = None
    video_url: Optional[str] = None
    photos: List[ReviewPhotoSchema] = []
    is_verified_purchase: bool = False
    is_featured: bool = False
    is_edited: bool = False
    status: str
    spam_score: int = 0
    ai_risk_level: str = "low"
    helpful_count: int = 0
    not_helpful_count: int = 0
    flag_count: int = 0
    admin_reply: Optional[str] = None
    admin_reply_at: Optional[datetime] = None
    admin_reply_by: Optional[str] = None
    rejection_reason: Optional[str] = None
    reports: List[AdminReviewReportItem] = []
    history: List[AdminReviewHistoryItem] = []
    created_at: datetime
    updated_at: datetime


class AdminReviewStats(BaseModel):
    total_reviews: int = 0
    pending_reviews: int = 0
    approved_reviews: int = 0
    rejected_reviews: int = 0
    hidden_reviews: int = 0
    reported_reviews: int = 0
    average_rating: float = 0.0
    reviews_today: int = 0
    photo_reviews: int = 0
    video_reviews: int = 0


class AdminReviewReplyRequest(BaseModel):
    reply: str = Field(..., min_length=1, max_length=2000)


class AdminReviewRejectRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500)
