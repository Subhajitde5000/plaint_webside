from datetime import datetime, timezone, date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.database import get_db
from app.dependencies import require_support_or_above, require_ops_or_above
from app.models.review import Review, ReviewPhoto, ReviewFlag, ReviewModerationHistory
from app.models.admin import AdminUser
from app.models.product import Product
from app.models.order import Order
from app.models.user import User
from app.schemas.review import (
    AdminReviewReplyRequest, AdminReviewRejectRequest,
    AdminReviewStats, AdminReviewListItem, AdminReviewDetail,
    AdminReviewReportItem, AdminReviewHistoryItem, ReviewPhotoSchema
)
from app.services.notification_service import NotificationService
from app.utils.pagination import paginate

router = APIRouter(prefix="/admin/reviews", tags=["Admin - Reviews"])
notification_service = NotificationService()


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


@router.get("/stats", response_model=AdminReviewStats)
async def get_review_stats(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_support_or_above),
):
    base = db.query(Review).filter(Review.deleted_at.is_(None))

    total = base.count()
    pending = base.filter(Review.status == "pending").count()
    approved = base.filter(Review.status == "published").count()
    rejected = base.filter(Review.status == "rejected").count()
    hidden = base.filter(Review.status == "hidden").count()
    reported = base.filter(or_(Review.status == "flagged", Review.flag_count > 0)).count()

    avg_rating = db.query(func.coalesce(func.avg(Review.rating), 0)).filter(
        Review.status == "published", Review.deleted_at.is_(None)
    ).scalar() or 0.0

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    reviews_today = base.filter(Review.created_at >= today_start).count()

    photo_reviews = base.filter(Review.photos.any()).count()
    video_reviews = base.filter(Review.video_url.isnot(None), Review.video_url != "").count()

    return AdminReviewStats(
        total_reviews=total,
        pending_reviews=pending,
        approved_reviews=approved,
        rejected_reviews=rejected,
        hidden_reviews=hidden,
        reported_reviews=reported,
        average_rating=round(float(avg_rating), 2),
        reviews_today=reviews_today,
        photo_reviews=photo_reviews,
        video_reviews=video_reviews,
    )


@router.get("/")
async def list_admin_reviews(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_support_or_above),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    status: Optional[str] = Query(None),  # "pending", "published", "rejected", "hidden", "flagged"
    rating: Optional[int] = Query(None, ge=1, le=5),
    verified_purchase: Optional[bool] = Query(None),
    has_photo: Optional[bool] = Query(None),
    has_video: Optional[bool] = Query(None),
    q: Optional[str] = Query(None),
    sort: str = Query("newest"),
):
    query = db.query(Review).filter(Review.deleted_at.is_(None))

    if status:
        if status == "reported" or status == "flagged":
            query = query.filter(or_(Review.status == "flagged", Review.flag_count > 0))
        else:
            query = query.filter(Review.status == status)

    if rating:
        query = query.filter(Review.rating == rating)
    if verified_purchase is not None:
        query = query.filter(Review.is_verified_purchase == verified_purchase)
    if has_photo:
        query = query.filter(Review.photos.any())
    if has_video:
        query = query.filter(Review.video_url.isnot(None), Review.video_url != "")

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.join(Product, isouter=True).filter(
            or_(
                Review.reviewer_name.ilike(term),
                Review.reviewer_email.ilike(term),
                Review.title.ilike(term),
                Review.body.ilike(term),
                Product.title.ilike(term),
            )
        )

    if sort == "oldest":
        query = query.order_by(Review.created_at.asc())
    elif sort == "rating_desc":
        query = query.order_by(Review.rating.desc(), Review.created_at.desc())
    elif sort == "rating_asc":
        query = query.order_by(Review.rating.asc(), Review.created_at.desc())
    elif sort == "helpful_desc":
        query = query.order_by(Review.helpful_count.desc(), Review.created_at.desc())
    elif sort == "flags_desc":
        query = query.order_by(Review.flag_count.desc(), Review.created_at.desc())
    else:  # newest
        query = query.order_by(Review.created_at.desc())

    paginated = paginate(query, page, page_size)

    items = []
    for r in paginated["items"]:
        items.append({
            "id": r.id,
            "uuid": r.uuid,
            "customer_name": r.reviewer_name,
            "customer_email": r.reviewer_email,
            "user_id": r.user_id,
            "product_id": r.product_id,
            "product_name": r.product.title if r.product else "Unknown Product",
            "order_id": r.order_item.order_id if (r.order_item and r.order_item.order) else None,
            "order_number": r.order_item.order.order_number if (r.order_item and r.order_item.order) else None,
            "rating": r.rating,
            "title": r.title,
            "body": r.body,
            "video_url": r.video_url,
            "photo_count": len(r.photos) if r.photos else 0,
            "is_verified_purchase": r.is_verified_purchase,
            "is_featured": r.is_featured,
            "status": r.status,
            "spam_score": r.spam_score or 0,
            "ai_risk_level": r.ai_risk_level or "low",
            "helpful_count": r.helpful_count or 0,
            "flag_count": r.flag_count or 0,
            "admin_reply": r.admin_reply,
            "created_at": r.created_at,
        })

    return {
        "items": items,
        "total": paginated["total"],
        "page": paginated["page"],
        "page_size": paginated["page_size"],
        "pages": paginated["pages"],
    }


@router.get("/{review_uuid}")
async def get_admin_review_detail(
    review_uuid: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_support_or_above),
):
    review = db.query(Review).filter(
        Review.uuid == review_uuid,
        Review.deleted_at.is_(None)
    ).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    reports = []
    for f in review.flags:
        reports.append({
            "id": f.id,
            "reason": f.reason,
            "reporter": f.reporter,
            "notes": f.notes,
            "created_at": f.created_at,
        })

    history = []
    for h in review.moderation_history:
        admin_name = f"{h.admin.first_name} {h.admin.last_name}" if h.admin else "System"
        history.append({
            "id": h.id,
            "action": h.action,
            "notes": h.notes,
            "admin_name": admin_name,
            "created_at": h.created_at,
        })

    admin_reply_by_name = None
    if review.admin_reply_by:
        admin_obj = db.query(AdminUser).filter(AdminUser.id == review.admin_reply_by).first()
        if admin_obj:
            admin_reply_by_name = f"{admin_obj.first_name} {admin_obj.last_name}"

    order_num = review.order_item.order.order_number if (review.order_item and review.order_item.order) else None
    order_id = review.order_item.order_id if review.order_item else None

    return {
        "id": review.id,
        "uuid": review.uuid,
        "customer_id": review.user_id,
        "customer_name": review.reviewer_name,
        "customer_email": review.reviewer_email,
        "product_id": review.product_id,
        "product_name": review.product.title if review.product else "",
        "product_slug": review.product.slug if review.product else "",
        "order_id": order_id,
        "order_number": order_num,
        "rating": review.rating,
        "title": review.title,
        "body": review.body,
        "video_url": review.video_url,
        "photos": [ReviewPhotoSchema.model_validate(p) for p in review.photos],
        "is_verified_purchase": review.is_verified_purchase,
        "is_featured": review.is_featured,
        "is_edited": review.is_edited,
        "status": review.status,
        "spam_score": review.spam_score or 0,
        "ai_risk_level": review.ai_risk_level or "low",
        "helpful_count": review.helpful_count or 0,
        "not_helpful_count": review.not_helpful_count or 0,
        "flag_count": review.flag_count or 0,
        "admin_reply": review.admin_reply,
        "admin_reply_at": review.admin_reply_at,
        "admin_reply_by": admin_reply_by_name,
        "rejection_reason": review.rejection_reason,
        "reports": reports,
        "history": history,
        "created_at": review.created_at,
        "updated_at": review.updated_at,
    }


@router.post("/{review_uuid}/approve")
async def approve_review(
    review_uuid: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_support_or_above),
):
    review = db.query(Review).filter(Review.uuid == review_uuid, Review.deleted_at.is_(None)).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    review.status = "published"
    review.moderated_by = admin.id
    review.moderated_at = datetime.now(timezone.utc)

    db.add(ReviewModerationHistory(
        review_id=review.id, admin_id=admin.id, action="Approved & Published"
    ))
    db.commit()

    update_product_rating_stats(db, review.product_id)

    # Notify customer
    if review.user:
        await notification_service.review_published(review.user, review)

    return {"message": "Review approved and published."}


@router.post("/{review_uuid}/reject")
async def reject_review(
    review_uuid: str,
    payload: AdminReviewRejectRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_support_or_above),
):
    review = db.query(Review).filter(Review.uuid == review_uuid, Review.deleted_at.is_(None)).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    prev_status = review.status
    review.status = "rejected"
    review.rejection_reason = payload.reason
    review.moderated_by = admin.id
    review.moderated_at = datetime.now(timezone.utc)

    db.add(ReviewModerationHistory(
        review_id=review.id, admin_id=admin.id, action="Rejected", notes=payload.reason
    ))
    db.commit()

    if prev_status == "published":
        update_product_rating_stats(db, review.product_id)

    # Notify customer
    if review.user:
        await notification_service.review_rejected(review.user, review)

    return {"message": "Review rejected."}


@router.post("/{review_uuid}/hide")
async def hide_review(
    review_uuid: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_support_or_above),
):
    review = db.query(Review).filter(Review.uuid == review_uuid, Review.deleted_at.is_(None)).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    review.status = "hidden"
    review.moderated_by = admin.id
    review.moderated_at = datetime.now(timezone.utc)

    db.add(ReviewModerationHistory(
        review_id=review.id, admin_id=admin.id, action="Hidden from Storefront"
    ))
    db.commit()

    update_product_rating_stats(db, review.product_id)
    return {"message": "Review hidden from storefront."}


@router.post("/{review_uuid}/restore")
async def restore_review(
    review_uuid: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_support_or_above),
):
    review = db.query(Review).filter(Review.uuid == review_uuid, Review.deleted_at.is_(None)).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    review.status = "published"
    review.moderated_by = admin.id
    review.moderated_at = datetime.now(timezone.utc)

    db.add(ReviewModerationHistory(
        review_id=review.id, admin_id=admin.id, action="Restored to Published"
    ))
    db.commit()

    update_product_rating_stats(db, review.product_id)
    return {"message": "Review restored and published."}


@router.post("/{review_uuid}/pin")
async def toggle_pin_review(
    review_uuid: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_support_or_above),
):
    review = db.query(Review).filter(Review.uuid == review_uuid, Review.deleted_at.is_(None)).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    review.is_featured = not review.is_featured
    action_str = "Pinned to Top" if review.is_featured else "Unpinned"

    db.add(ReviewModerationHistory(
        review_id=review.id, admin_id=admin.id, action=action_str
    ))
    db.commit()

    return {"message": f"Review {action_str.lower()}.", "is_featured": review.is_featured}


@router.post("/{review_uuid}/reply")
async def reply_to_review(
    review_uuid: str,
    payload: AdminReviewReplyRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_support_or_above),
):
    review = db.query(Review).filter(Review.uuid == review_uuid, Review.deleted_at.is_(None)).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    review.admin_reply = payload.reply
    review.admin_reply_at = datetime.now(timezone.utc)
    review.admin_reply_by = admin.id

    db.add(ReviewModerationHistory(
        review_id=review.id, admin_id=admin.id, action="Official Store Reply Posted", notes=payload.reply[:100]
    ))
    db.commit()

    # Notify customer
    if review.user:
        await notification_service.review_replied(review.user, review)

    return {"message": "Store reply saved."}


@router.delete("/{review_uuid}/media/{photo_id}")
async def delete_review_photo(
    review_uuid: str,
    photo_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_ops_or_above),
):
    photo = db.query(ReviewPhoto).join(Review).filter(
        Review.uuid == review_uuid,
        ReviewPhoto.id == photo_id
    ).first()

    if not photo:
        raise HTTPException(status_code=404, detail="Media not found.")

    db.delete(photo)
    db.commit()

    return {"message": "Media deleted."}


@router.delete("/{review_uuid}", status_code=204)
async def delete_review_admin(
    review_uuid: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(require_ops_or_above),
):
    review = db.query(Review).filter(Review.uuid == review_uuid).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    product_id = review.product_id
    review.deleted_at = datetime.now(timezone.utc)
    review.status = "hidden"
    db.commit()

    update_product_rating_stats(db, product_id)
