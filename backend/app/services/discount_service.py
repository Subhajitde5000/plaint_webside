from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable, Optional

from sqlalchemy.orm import Session

from app.models.discount import Discount, DiscountUsage
from app.models.order import Order
from app.models.category import ProductCollection
from app.models.user import User


@dataclass(frozen=True)
class DiscountResult:
    discount: Discount
    amount: float
    free_shipping: bool


class DiscountService:
    """Single source of truth for coupon and automatic discount evaluation."""

    def __init__(self, db: Session):
        self.db = db

    def evaluate_code(self, code: str, user: User, items: Iterable[dict], subtotal: float) -> DiscountResult:
        discount = self.db.query(Discount).filter(
            Discount.method == "code", Discount.code == code.strip().upper()
        ).first()
        if not discount:
            raise ValueError("Invalid discount code.")
        return self._evaluate(discount, user, list(items), subtotal)

    def find_automatic(self, user: User, items: Iterable[dict], subtotal: float) -> Optional[DiscountResult]:
        candidates = self.db.query(Discount).filter(
            Discount.method == "automatic", Discount.status == "active"
        ).all()
        valid = []
        for discount in candidates:
            try:
                valid.append(self._evaluate(discount, user, list(items), subtotal))
            except ValueError:
                continue
        return max(valid, key=lambda result: result.amount, default=None)

    def _evaluate(self, discount: Discount, user: User, items: list[dict], subtotal: float) -> DiscountResult:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        if discount.status != "active" or discount.starts_at > now or (discount.ends_at and discount.ends_at <= now):
            raise ValueError("This discount is not currently active.")
        if discount.usage_limit_total is not None and discount.usage_count >= discount.usage_limit_total:
            raise ValueError("This discount has reached its usage limit.")
        if discount.min_requirement_type == "amount" and subtotal < float(discount.min_requirement_value or 0):
            raise ValueError(f"Minimum order of ₹{discount.min_requirement_value:.0f} required.")
        if discount.min_requirement_type == "quantity" and sum(item["quantity"] for item in items) < int(discount.min_requirement_value or 0):
            raise ValueError("Minimum item quantity has not been reached.")
        self._validate_customer(discount, user)
        eligible_subtotal = self._eligible_subtotal(discount, items)
        if eligible_subtotal <= 0 and discount.discount_type != "free_shipping":
            raise ValueError("No eligible products are in your cart.")
        amount = self._calculate_amount(discount, eligible_subtotal)
        return DiscountResult(discount=discount, amount=amount, free_shipping=discount.discount_type == "free_shipping")

    def _validate_customer(self, discount: Discount, user: User) -> None:
        if discount.customer_eligibility == "first_time" or discount.first_time_only:
            if self.db.query(Order.id).filter(Order.user_id == user.id).first():
                raise ValueError("This discount is only available on your first order.")
        if discount.usage_limit_per_customer:
            uses = self.db.query(DiscountUsage.id).filter(
                DiscountUsage.discount_id == discount.id, DiscountUsage.user_id == user.id
            ).count()
            if uses >= discount.usage_limit_per_customer:
                raise ValueError("You have already used this discount.")

    def _eligible_subtotal(self, discount: Discount, items: list[dict]) -> float:
        if discount.applies_to == "all":
            return sum(item["price"] * item["quantity"] for item in items)
        product_ids = {relation.product_id for relation in discount.products if not relation.is_excluded}
        if discount.applies_to == "specific_collections":
            collection_ids = {relation.collection_id for relation in discount.collections}
            product_ids = {product_id for (product_id,) in self.db.query(ProductCollection.product_id).filter(ProductCollection.collection_id.in_(collection_ids)).all()}
        return sum(item["price"] * item["quantity"] for item in items if item["product_id"] in product_ids)

    @staticmethod
    def _calculate_amount(discount: Discount, subtotal: float) -> float:
        if discount.discount_type == "percentage":
            amount = subtotal * float(discount.value or 0) / 100
            if discount.max_discount_amount is not None:
                amount = min(amount, float(discount.max_discount_amount))
            return round(amount, 2)
        if discount.discount_type == "fixed_amount":
            return round(min(float(discount.value or 0), subtotal), 2)
        return 0.0
