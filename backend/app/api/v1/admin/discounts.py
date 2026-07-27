import json
import uuid as _uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin, require_marketing, require_ops_or_above, require_role
from app.models.admin import AdminUser
from app.models.discount import BogoConfig, Discount, DiscountAuditLog, DiscountCollection, DiscountProduct, DiscountUsage
from app.models.order import Order
from app.schemas.discount import CreateDiscountRequest, UpdateDiscountRequest
from app.utils.pagination import paginate

router = APIRouter(prefix="/admin/discounts", tags=["Admin - Discounts"])
REPORT_ROLES = require_role("super_admin", "operations_manager", "analyst")


def _not_found(db: Session, discount_uuid: str) -> Discount:
    discount = db.query(Discount).filter(Discount.uuid == discount_uuid).first()
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found.")
    return discount


def _audit(db: Session, discount: Discount, admin: AdminUser, action: str, details: Optional[dict] = None) -> None:
    db.add(DiscountAuditLog(discount_id=discount.id, admin_id=admin.id, action=action,
                            details=json.dumps(details) if details else None))


def _sync_relations(db: Session, discount: Discount, product_ids: Optional[list[int]],
                    collection_ids: Optional[list[int]], bogo_config: Optional[dict], *, replace: bool) -> None:
    if replace and product_ids is not None:
        db.query(DiscountProduct).filter(DiscountProduct.discount_id == discount.id).delete()
    if product_ids is not None:
        db.add_all([DiscountProduct(discount_id=discount.id, product_id=product_id) for product_id in set(product_ids)])
    if replace and collection_ids is not None:
        db.query(DiscountCollection).filter(DiscountCollection.discount_id == discount.id).delete()
    if collection_ids is not None:
        db.add_all([DiscountCollection(discount_id=discount.id, collection_id=collection_id) for collection_id in set(collection_ids)])
    if bogo_config is not None:
        current = db.query(BogoConfig).filter(BogoConfig.discount_id == discount.id).first()
        if current:
            for key, value in bogo_config.items():
                setattr(current, key, value)
        else:
            db.add(BogoConfig(discount_id=discount.id, **bogo_config))


@router.get("/")
def list_discounts(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin),
                   page: int = Query(1, ge=1), page_size: int = Query(25, ge=1, le=100),
                   status: Optional[str] = None, discount_type: Optional[str] = None,
                   method: Optional[str] = None, q: Optional[str] = None, sort: str = "newest"):
    query = db.query(Discount).filter(Discount.status != "archived")
    if status and status != "all": query = query.filter(Discount.status == status)
    if discount_type: query = query.filter(Discount.discount_type == discount_type)
    if method: query = query.filter(Discount.method == method)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(Discount.code.ilike(like), Discount.title.ilike(like), Discount.uuid.ilike(like)))
    sort_fields = {"newest": Discount.created_at.desc(), "oldest": Discount.created_at.asc(), "most_used": Discount.usage_count.desc(), "highest_value": Discount.value.desc(), "expiring_soonest": Discount.ends_at.asc(), "az": Discount.title.asc()}
    return paginate(query.order_by(sort_fields.get(sort, Discount.created_at.desc())), page, page_size)


@router.get("/check-code")
def check_discount_code(code: str = Query(..., min_length=1), exclude_id: Optional[str] = None,
                        db: Session = Depends(get_db), admin: AdminUser = Depends(require_marketing)):
    query = db.query(Discount).filter(func.upper(Discount.code) == code.strip().upper(), Discount.status != "archived")
    if exclude_id: query = query.filter(Discount.uuid != exclude_id)
    return {"available": query.first() is None}


@router.post("/", status_code=201)
def create_discount(payload: CreateDiscountRequest, db: Session = Depends(get_db), admin: AdminUser = Depends(require_marketing)):
    data = payload.model_dump()
    product_ids, collection_ids, bogo_config = data.pop("product_ids"), data.pop("collection_ids"), data.pop("bogo_config")
    code = data.get("code")
    if code:
        data["code"] = code.strip().upper()
        if db.query(Discount).filter(func.upper(Discount.code) == data["code"], Discount.status != "archived").first():
            raise HTTPException(status_code=409, detail="Discount code already exists.")
    discount = Discount(uuid=str(_uuid.uuid4()), created_by=admin.id, **data)
    db.add(discount); db.flush()
    _sync_relations(db, discount, product_ids, collection_ids, bogo_config, replace=False)
    _audit(db, discount, admin, "created")
    db.commit(); db.refresh(discount)
    return discount


@router.get("/{discount_uuid}")
def get_discount(discount_uuid: str, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    return _not_found(db, discount_uuid)


@router.put("/{discount_uuid}")
def update_discount(discount_uuid: str, payload: UpdateDiscountRequest, db: Session = Depends(get_db), admin: AdminUser = Depends(require_marketing)):
    discount = _not_found(db, discount_uuid)
    data = payload.model_dump(exclude_unset=True)
    product_ids, collection_ids, bogo_config = data.pop("product_ids", None), data.pop("collection_ids", None), data.pop("bogo_config", None)
    if "code" in data and data["code"]:
        data["code"] = data["code"].strip().upper()
        exists = db.query(Discount).filter(func.upper(Discount.code) == data["code"], Discount.uuid != discount.uuid, Discount.status != "archived").first()
        if exists: raise HTTPException(status_code=409, detail="Discount code already exists.")
    for field, value in data.items(): setattr(discount, field, value)
    _sync_relations(db, discount, product_ids, collection_ids, bogo_config, replace=True)
    _audit(db, discount, admin, "updated", {"fields": sorted(data.keys())})
    db.commit(); db.refresh(discount)
    return discount


@router.delete("/{discount_uuid}")
def delete_discount(discount_uuid: str, db: Session = Depends(get_db), admin: AdminUser = Depends(require_ops_or_above)):
    discount = _not_found(db, discount_uuid)
    discount.status = "archived"
    _audit(db, discount, admin, "archived")
    db.commit()
    return {"message": "Discount archived."}


@router.post("/{discount_uuid}/activate")
def activate_discount(discount_uuid: str, db: Session = Depends(get_db), admin: AdminUser = Depends(require_marketing)):
    discount = _not_found(db, discount_uuid)
    if discount.status == "archived": raise HTTPException(status_code=409, detail="Archived discounts cannot be activated.")
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if discount.ends_at and discount.ends_at <= now: raise HTTPException(status_code=409, detail="Expired discounts cannot be activated.")
    discount.status = "scheduled" if discount.starts_at > now else "active"
    _audit(db, discount, admin, "activated")
    db.commit(); return {"status": discount.status}


@router.post("/{discount_uuid}/deactivate")
def deactivate_discount(discount_uuid: str, db: Session = Depends(get_db), admin: AdminUser = Depends(require_marketing)):
    discount = _not_found(db, discount_uuid)
    discount.status = "paused"; _audit(db, discount, admin, "paused")
    db.commit(); return {"status": discount.status}


@router.post("/{discount_uuid}/duplicate", status_code=201)
def duplicate_discount(discount_uuid: str, body: dict, db: Session = Depends(get_db), admin: AdminUser = Depends(require_marketing)):
    source = _not_found(db, discount_uuid); new_code = body.get("new_code", "").strip().upper()
    if source.method == "code" and not new_code: raise HTTPException(status_code=422, detail="new_code is required for code discounts.")
    if new_code and db.query(Discount).filter(func.upper(Discount.code) == new_code, Discount.status != "archived").first(): raise HTTPException(status_code=409, detail="Discount code already exists.")
    clone = Discount(uuid=str(_uuid.uuid4()), created_by=admin.id, code=new_code or None, title=f"{source.title} (Copy)", method=source.method, discount_type=source.discount_type, value=source.value, max_discount_amount=source.max_discount_amount, applies_to=source.applies_to, exclude_sale_items=source.exclude_sale_items, customer_eligibility=source.customer_eligibility, min_loyalty_tier=source.min_loyalty_tier, first_time_only=source.first_time_only, min_requirement_type=source.min_requirement_type, min_requirement_value=source.min_requirement_value, usage_limit_total=source.usage_limit_total, usage_limit_per_customer=source.usage_limit_per_customer, combine_with_product=source.combine_with_product, combine_with_order=source.combine_with_order, combine_with_shipping=source.combine_with_shipping, starts_at=source.starts_at, ends_at=source.ends_at, status="draft")
    db.add(clone); db.flush(); _audit(db, clone, admin, "duplicated", {"source_uuid": source.uuid}); db.commit(); db.refresh(clone)
    return clone


@router.get("/{discount_uuid}/report")
def discount_report(discount_uuid: str, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None,
                    db: Session = Depends(get_db), admin: AdminUser = Depends(REPORT_ROLES)):
    discount = _not_found(db, discount_uuid)
    usage = db.query(DiscountUsage).filter(DiscountUsage.discount_id == discount.id)
    if date_from: usage = usage.filter(DiscountUsage.created_at >= date_from)
    if date_to: usage = usage.filter(DiscountUsage.created_at <= date_to)
    times_used, total_discount = usage.with_entities(func.count(DiscountUsage.id), func.coalesce(func.sum(DiscountUsage.discount_amount), 0)).one()
    revenue = db.query(func.coalesce(func.sum(Order.total), 0)).join(DiscountUsage, DiscountUsage.order_id == Order.id).filter(DiscountUsage.discount_id == discount.id).scalar()
    return {"times_used": times_used, "total_discount_given": total_discount, "revenue_generated": revenue, "orders_created": times_used}
