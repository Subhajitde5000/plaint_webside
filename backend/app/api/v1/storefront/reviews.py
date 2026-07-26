import uuid as _uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.dependencies import get_current_user, get_optional_user
from app.models.review import Review, ReviewPhoto, ReviewFlag, ReviewHelpfulVote
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.review import (
    SubmitReviewRequest, EditReviewRequest, ReviewHelpfulRequest,
    ReviewReportRequest, ProductReviewsResponse, ReviewSchema,
    RatingDistribution, MyReviewItem, MyReviewProductInfo
)
from app.utils.pagination import paginate

router = APIRouter(prefix="/reviews", tags=["Reviews"])

PROFANITY_WORDS = {"spam", "scam", "cheat", "fraud", "fake", "badword", "stupid", "idiot"}


def compute_spam_score(title: Optional[str], body: Optional[str]) -> int:
    score = 0
    text = f"{title or ''} {body or ''}".lower()
    if not body or len(body.strip()) < 10:
        score += 30
    for word in PROFANITY_WORDS:
        if word in text:
            score += 25
    if text.isupper():
        score += 20
    return min(score, 100)


def update_product_rating_stats(db: Session, product_id: int):
    stats = db.query(
        func.coalesce(func.avg(Review.rating), 0).label("avg"),
        func.count(Review.id).label("count")
    ).filter(
        Review.product_id == product_id,
        Review.status == "published",
        Review.deleted_at.is_(None),
    ).first()

    avg_val = round(float(stats.avg), 2) if stats else 0.0
    count_val = int(stats.count) if stats else 0

    db.query(Product).filter(Product.id == product_id).update({
        "rating_average": avg_val,
        "rating_count": count_val,
    })
    db.commit()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def submit_review(
    payload: SubmitReviewRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # 1. Product existence check
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    # 2. Check duplicate review for user & product
    existing_query = db.query(Review).filter(
        Review.user_id == user.id,
        Review.product_id == payload.product_id,
        Review.deleted_at.is_(None),
        Review.status != "rejected",
    )
    if payload.order_item_id:
        existing_query = existing_query.filter(Review.order_item_id == payload.order_item_id)

    if existing_query.first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted a review for this order item / product."
        )

    # 3. Verification & Order delivery check
    is_verified = False
    order_item = None

    if payload.order_item_id:
        order_item = db.query(OrderItem).filter(OrderItem.id == payload.order_item_id).first()
        if not order_item or not order_item.order or order_item.order.user_id != user.id:
            raise HTTPException(status_code=400, detail="Invalid order item for your account.")
        if order_item.order.status not in ["delivered", "completed"]:
            raise HTTPException(
                status_code=400,
                detail="Review is only allowed after order has been delivered."
            )
        is_verified = True
    else:
        # Check if user has any delivered order containing this product
        delivered_item = db.query(OrderItem).join(Order).filter(
            Order.user_id == user.id,
            OrderItem.product_id == payload.product_id,
            Order.status.in_(["delivered", "completed"])
        ).first()
        if delivered_item:
            is_verified = True
            order_item = delivered_item

    # 4. Spam score & Auto-moderation check
    spam_score = compute_spam_score(payload.title, payload.body)
    ai_risk = "high" if spam_score >= 50 else ("medium" if spam_score >= 20 else "low")
    
    # Auto approve if high rating, low spam score, and verified
    status_val = "pending"
    if is_verified and spam_score < 20 and payload.rating >= 4:
        status_val = "published"

    review = Review(
        uuid=str(_uuid.uuid4()),
        product_id=payload.product_id,
        user_id=user.id,
        order_item_id=order_item.id if order_item else None,
        reviewer_name=payload.reviewer_name or f"{user.first_name} {user.last_name}".strip(),
        reviewer_email=payload.reviewer_email or user.email,
        rating=payload.rating,
        title=payload.title,
        body=payload.body,
        video_url=payload.video_url,
        is_verified_purchase=is_verified,
        status=status_val,
        spam_score=spam_score,
        ai_risk_level=ai_risk,
    )
    db.add(review)
    db.flush()

    # Save photo URLs
    if payload.photos:
        for idx, photo_url in enumerate(payload.photos, start=1):
            if photo_url and photo_url.strip():
                db.add(ReviewPhoto(
                    review_id=review.id,
                    url=photo_url.strip(),
                    position=idx
                ))

    db.commit()

    # If auto-approved, update rating cache
    if status_val == "published":
        update_product_rating_stats(db, payload.product_id)

    return {
        "message": "Review published successfully!" if status_val == "published" else "Review submitted for moderation.",
        "review_uuid": review.uuid,
        "status": status_val
    }


@router.get("/product/{product_id}")
async def get_product_reviews(
    product_id: int,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    rating: Optional[int] = Query(None, ge=1, le=5),
    with_images: Optional[bool] = Query(None),
    with_video: Optional[bool] = Query(None),
    verified_only: Optional[bool] = Query(None),
    sort: str = Query("newest"),  # "newest", "helpful", "highest_rating", "lowest_rating"
    user: Optional[User] = Depends(get_optional_user),
):
    base_query = db.query(Review).filter(
        Review.product_id == product_id,
        Review.status == "published",
        Review.deleted_at.is_(None),
    )

    # Compute Rating Distribution across all published reviews for this product
    all_published = base_query.all()
    total_count = len(all_published)
    star_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    photo_count = 0
    video_count = 0
    verified_count = 0
    sum_rating = 0

    for r in all_published:
        star_counts[r.rating] = star_counts.get(r.rating, 0) + 1
        sum_rating += r.rating
        if r.photos and len(r.photos) > 0:
            photo_count += 1
        if r.video_url:
            video_count += 1
        if r.is_verified_purchase:
            verified_count += 1

    distribution = RatingDistribution(
        average=round(sum_rating / total_count, 2) if total_count > 0 else 0.0,
        total_reviews=total_count,
        star_5=star_counts[5],
        star_4=star_counts[4],
        star_3=star_counts[3],
        star_2=star_counts[2],
        star_1=star_counts[1],
        photo_count=photo_count,
        video_count=video_count,
        verified_count=verified_count,
    )

    # Apply Filters for requested list
    filtered_query = base_query
    if rating:
        filtered_query = filtered_query.filter(Review.rating == rating)
    if with_images:
        filtered_query = filtered_query.filter(Review.photos.any())
    if with_video:
        filtered_query = filtered_query.filter(Review.video_url.isnot(None), Review.video_url != "")
    if verified_only:
        filtered_query = filtered_query.filter(Review.is_verified_purchase == True)

    # Apply Sorting
    if sort == "helpful":
        filtered_query = filtered_query.order_by(Review.helpful_count.desc(), Review.created_at.desc())
    elif sort == "highest_rating":
        filtered_query = filtered_query.order_by(Review.rating.desc(), Review.created_at.desc())
    elif sort == "lowest_rating":
        filtered_query = filtered_query.order_by(Review.rating.asc(), Review.created_at.desc())
    else:  # "newest"
        filtered_query = filtered_query.order_by(Review.is_featured.desc(), Review.created_at.desc())

    paginated = paginate(filtered_query, page, page_size)

    # Attach user_voted_helpful if user is logged in
    user_votes_map = {}
    if user:
        review_ids = [r.id for r in paginated["items"]]
        if review_ids:
            votes = db.query(ReviewHelpfulVote).filter(
                ReviewHelpfulVote.user_id == user.id,
                ReviewHelpfulVote.review_id.in_(review_ids)
            ).all()
            user_votes_map = {v.review_id: v.is_helpful for v in votes}

    items_output = []
    for r in paginated["items"]:
        item_dict = ReviewSchema.model_validate(r).model_dump()
        item_dict["user_voted_helpful"] = user_votes_map.get(r.id, None)
        items_output.append(item_dict)

    return {
        "items": items_output,
        "total": paginated["total"],
        "page": paginated["page"],
        "page_size": paginated["page_size"],
        "pages": paginated["pages"],
        "distribution": distribution,
    }


@router.get("/my")
async def get_my_reviews(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    reviews = db.query(Review).filter(
        Review.user_id == user.id,
        Review.deleted_at.is_(None),
    ).order_by(Review.created_at.desc()).all()

    results = []
    now = datetime.now(timezone.utc)

    for r in reviews:
        # Edit window: 30 days
        created_at_dt = r.created_at
        if created_at_dt.tzinfo is None:
            created_at_dt = created_at_dt.replace(tzinfo=timezone.utc)
        days_passed = (now - created_at_dt).days
        can_edit = days_passed <= 30
        days_left = max(0, 30 - days_passed)

        prod_info = None
        if r.product:
            img_url = r.product.images[0].url if r.product.images else None
            prod_info = MyReviewProductInfo(
                id=r.product.id,
                title=r.product.title,
                slug=r.product.slug,
                image_url=img_url,
            )

        order_num = r.order_item.order.order_number if (r.order_item and r.order_item.order) else None

        results.append({
            "id": r.id,
            "uuid": r.uuid,
            "product_id": r.product_id,
            "product": prod_info,
            "order_number": order_num,
            "rating": r.rating,
            "title": r.title,
            "body": r.body,
            "video_url": r.video_url,
            "photos": [ReviewPhotoSchema.model_validate(p) for p in r.photos],
            "status": r.status,
            "is_verified_purchase": r.is_verified_purchase,
            "is_edited": r.is_edited,
            "edited_at": r.edited_at,
            "helpful_count": r.helpful_count,
            "admin_reply": r.admin_reply,
            "admin_reply_at": r.admin_reply_at,
            "created_at": r.created_at,
            "can_edit": can_edit,
            "days_left_to_edit": days_left,
            "order_item_id": r.order_item_id,
        })

    return results


@router.patch("/{review_uuid}")
async def edit_review(
    review_uuid: str,
    payload: EditReviewRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(
        Review.uuid == review_uuid,
        Review.user_id == user.id,
        Review.deleted_at.is_(None)
    ).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    # Check 30-day window
    created_at_dt = review.created_at
    if created_at_dt.tzinfo is None:
        created_at_dt = created_at_dt.replace(tzinfo=timezone.utc)
    if (datetime.now(timezone.utc) - created_at_dt).days > 30:
        raise HTTPException(
            status_code=400,
            detail="Reviews can only be edited within 30 days of submission."
        )

    if payload.rating is not None:
        review.rating = payload.rating
    if payload.title is not None:
        review.title = payload.title
    if payload.body is not None:
        review.body = payload.body
    if payload.video_url is not None:
        review.video_url = payload.video_url

    review.is_edited = True
    review.edited_at = datetime.now(timezone.utc)

    if payload.photos is not None:
        db.query(ReviewPhoto).filter(ReviewPhoto.review_id == review.id).delete()
        for idx, photo_url in enumerate(payload.photos, start=1):
            if photo_url and photo_url.strip():
                db.add(ReviewPhoto(
                    review_id=review.id,
                    url=photo_url.strip(),
                    position=idx
                ))

    db.commit()

    if review.status == "published":
        update_product_rating_stats(db, review.product_id)

    return {"message": "Review updated successfully.", "review_uuid": review.uuid}


@router.delete("/{review_uuid}", status_code=200)
async def delete_review_customer(
    review_uuid: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(
        Review.uuid == review_uuid,
        Review.user_id == user.id,
        Review.deleted_at.is_(None)
    ).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    # Soft delete: set status to hidden & record deleted_at
    review.deleted_at = datetime.now(timezone.utc)
    review.status = "hidden"
    db.commit()

    update_product_rating_stats(db, review.product_id)

    return {"message": "Review deleted."}


@router.post("/{review_id}/helpful")
async def vote_helpful(
    review_id: int,
    payload: ReviewHelpfulRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id, Review.deleted_at.is_(None)).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    existing_vote = db.query(ReviewHelpfulVote).filter(
        ReviewHelpfulVote.review_id == review_id,
        ReviewHelpfulVote.user_id == user.id,
    ).first()

    if existing_vote:
        if existing_vote.is_helpful == payload.helpful:
            return {"message": "You have already voted."}
        # Change vote
        existing_vote.is_helpful = payload.helpful
        if payload.helpful:
            review.helpful_count += 1
            review.not_helpful_count = max(0, review.not_helpful_count - 1)
        else:
            review.helpful_count = max(0, review.helpful_count - 1)
            review.not_helpful_count += 1
    else:
        db.add(ReviewHelpfulVote(
            review_id=review_id,
            user_id=user.id,
            is_helpful=payload.helpful
        ))
        if payload.helpful:
            review.helpful_count += 1
        else:
            review.not_helpful_count += 1

    db.commit()
    return {
        "message": "Thank you for your vote.",
        "helpful_count": review.helpful_count,
        "not_helpful_count": review.not_helpful_count,
    }


@router.post("/{review_id}/report")
async def report_review(
    review_id: int,
    payload: ReviewReportRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id, Review.deleted_at.is_(None)).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    # Map request reason to DB enum
    reason_map = {
        "spam": "spam",
        "fake_review": "fake_purchase",
        "offensive": "inappropriate_language",
        "harassment": "inappropriate_language",
        "wrong_product": "off_topic",
        "other": "other",
    }
    db_reason = reason_map.get(payload.reason, "other")

    db.add(ReviewFlag(
        review_id=review_id,
        user_id=user.id,
        reason=db_reason,
        reporter="customer",
        notes=payload.notes or f"Customer reported as {payload.reason}",
    ))

    review.flag_count += 1
    if review.flag_count >= 5:
        review.status = "flagged"

    db.commit()
    return {"message": "Review reported. Our team will inspect it."}
