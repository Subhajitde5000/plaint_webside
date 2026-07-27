import math
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction
from app.models.order import Order, Return
from app.models.user import User

# Business Rules:
# Earning: ₹100 spent = 1 Green Point (calculated strictly on net amount actually paid)
EARN_RATE_RUPEES_PER_POINT = 100
# Redemption: 1 Green Point = ₹1 discount
POINTS_TO_RUPEE = 1.0
MIN_REDEEM_POINTS = 10
MAX_REDEEM_PERCENT = 50.0   # Max 50% discount on post-coupon order subtotal
MIN_PAYABLE_AMOUNT = 10.0   # Final payable total cannot become less than ₹10.00

SILVER_THRESHOLD = 500       # lifetime points to reach Silver
GOLD_THRESHOLD = 2000        # lifetime points to reach Gold
RETURN_WINDOW_DAYS = 7


def is_coupon_restricted_for_loyalty(
    discount_type: Optional[str] = None,
    discount_value: Optional[float] = None,
    discount_code: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Checks if a coupon is restricted from being combined with loyalty points.
    Allowed: Shipping coupons, fixed discount < 20% of cart, percentage discount < 20%.
    Restricted: Coupons 20%+, BOGO, or Flash Sales.
    """
    if not discount_type and not discount_code:
        return False, ""

    if discount_type == "bogo":
        return True, "Loyalty points cannot be combined with BOGO (Buy One Get One) coupons."

    if discount_type == "percentage" and discount_value and float(discount_value) >= 20.0:
        return True, f"Loyalty points cannot be combined with large promotional coupons ({float(discount_value):.0f}% OFF)."

    if discount_code:
        code_upper = str(discount_code).upper()
        if "FLASH" in code_upper or "BOGO" in code_upper:
            return True, "Loyalty points cannot be combined with Flash Sale or BOGO coupons."

    return False, ""


class LoyaltyService:
    def __init__(self, db: Session):
        self.db = db

    def sync_tier(self, account: LoyaltyAccount) -> None:
        """Helper to ensure tier is automatically updated based on lifetime_points."""
        if not account:
            return
        lifetime = account.lifetime_points or 0
        if lifetime >= GOLD_THRESHOLD:
            account.tier = "gold"
        elif lifetime >= SILVER_THRESHOLD:
            account.tier = "silver"
        else:
            account.tier = "plant_lover"

    def get_or_create_account(self, user_id: int) -> LoyaltyAccount:
        account = self.db.query(LoyaltyAccount).filter(
            LoyaltyAccount.user_id == user_id
        ).first()
        if not account:
            account = LoyaltyAccount(user_id=user_id, points_balance=0, points_reserved=0, lifetime_points=0, tier="plant_lover")
            self.db.add(account)
            self.db.flush()
        else:
            self.sync_tier(account)
            if (account.points_reserved or 0) > (account.points_balance or 0):
                account.points_reserved = max(0, account.points_balance or 0)
        return account


    def validate_redemption(
        self,
        user_id: int,
        points: int,
        subtotal: float,
        coupon_discount_amount: float = 0.0,
        discount_type: Optional[str] = None,
        discount_value: Optional[float] = None,
        discount_code: Optional[str] = None,
        shipping_fee: float = 0.0,
        tax_amount: float = 0.0,
    ) -> Tuple[bool, str, float]:
        """
        Backend Validation for Green Points redemption:
        1. Customer Active
        2. Enough Points (unreserved available points)
        3. Minimum Redeem Points (min 10)
        4. Maximum Redeem Limit (50% of post-coupon subtotal)
        5. Cannot combine points with 20%+ coupons, BOGO, or flash sales (Shipping coupons allowed)
        6. Payable total cannot fall below MIN_PAYABLE_AMOUNT (₹10.00)
        7. Points Not Expired / Valid Account
        Returns: (is_valid: bool, message: str, discount_amount: float)
        """
        if points <= 0:
            return True, "No points requested", 0.0

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            return False, "Customer account is inactive or not found.", 0.0

        # Rule Check: Large promotional coupons (20%+, BOGO, Flash Sale) cannot combine with loyalty points
        is_restricted, restrict_msg = is_coupon_restricted_for_loyalty(discount_type, discount_value, discount_code)
        if is_restricted:
            return False, restrict_msg, 0.0

        account = self.get_or_create_account(user_id)
        avail = account.available_points

        if points < MIN_REDEEM_POINTS:
            return False, f"Minimum {MIN_REDEEM_POINTS} Green Points required to redeem.", 0.0

        if avail < points:
            return False, f"Insufficient available Green Points. You have {avail} points available.", 0.0

        post_coupon_subtotal = max(0.0, subtotal - coupon_discount_amount)
        if post_coupon_subtotal <= 0:
            return False, "Order subtotal is fully covered by coupon discount.", 0.0

        # Max 50% discount cap on post-coupon subtotal
        max_allowed_discount = round(post_coupon_subtotal * (MAX_REDEEM_PERCENT / 100.0), 2)

        # Minimum Payable Amount Check: Ensure final total does not drop below MIN_PAYABLE_AMOUNT (₹10.00)
        total_before_points = post_coupon_subtotal + shipping_fee + tax_amount
        max_discount_for_min_payable = max(0.0, total_before_points - MIN_PAYABLE_AMOUNT)
        max_allowed_discount = min(max_allowed_discount, max_discount_for_min_payable)

        max_allowed_points = int(max_allowed_discount / POINTS_TO_RUPEE)

        if points > max_allowed_points:
            return False, f"Maximum redemption limit is {max_allowed_points} Green Points for this order.", 0.0

        discount = round(points * POINTS_TO_RUPEE, 2)
        if discount > max_allowed_discount:
            discount = max_allowed_discount

        return True, "Points valid", discount

    def reserve_points(self, user_id: int, points: int) -> None:
        """
        Reserve Green Points during order creation (Notice: Reserve, don't deduct yet).
        """
        if points <= 0:
            return

        account = self.db.query(LoyaltyAccount).filter(
            LoyaltyAccount.user_id == user_id
        ).with_for_update().first()

        if not account or account.available_points < points:
            raise ValueError("Insufficient available Green Points to reserve.")

        account.points_reserved = (account.points_reserved or 0) + points

    def release_reserved_points(self, user_id: int, points: int) -> None:
        """
        Release reserved Green Points if payment fails or order creation rolls back.
        """
        if points <= 0:
            return

        account = self.db.query(LoyaltyAccount).filter(
            LoyaltyAccount.user_id == user_id
        ).with_for_update().first()

        if account:
            account.points_reserved = max(0, (account.points_reserved or 0) - points)

    def confirm_redeemed_points(self, user_id: int, points: int, order: Order) -> float:
        """
        Confirm deduction of reserved points after payment is verified/completed.
        Converts reserved points to deducted points and creates a LoyaltyTransaction ('redeemed').
        """
        if points <= 0:
            return 0.0

        account = self.db.query(LoyaltyAccount).filter(
            LoyaltyAccount.user_id == user_id
        ).with_for_update().first()

        if not account:
            raise ValueError("Loyalty account not found.")

        # Check if transaction already exists for this order to prevent double deduction
        existing_tx = self.db.query(LoyaltyTransaction).filter(
            LoyaltyTransaction.order_id == order.id,
            LoyaltyTransaction.type == "redeemed"
        ).first()

        if existing_tx:
            return round(points * POINTS_TO_RUPEE, 2)

        # Release reservation & deduct balance
        account.points_reserved = max(0, (account.points_reserved or 0) - points)
        account.points_balance = max(0, (account.points_balance or 0) - points)

        discount = round(points * POINTS_TO_RUPEE, 2)

        self.db.add(LoyaltyTransaction(
            user_id=user_id,
            type="redeemed",
            points=-points,
            balance_after=account.points_balance,
            description=f"Redeemed {points} Green Points for order {order.order_number}",
            order_id=order.id,
        ))
        return discount

    def earn_points(self, user_id: int, order: Order) -> int:
        """
        Calculate & credit earned Green Points (₹100 = 1 Green Point).
        Rule: Earn points ONLY on the amount actually paid after discounts (order.total).
        Should be called after return window expires.
        """
        # Guard: check if already awarded for this order
        existing_tx = self.db.query(LoyaltyTransaction).filter(
            LoyaltyTransaction.order_id == order.id,
            LoyaltyTransaction.type == "earned"
        ).first()
        if existing_tx:
            return 0

        # Calculate earned points: ₹100 actually paid = 1 Green Point
        net_amount_paid = float(order.total)
        points_earned = int(net_amount_paid // EARN_RATE_RUPEES_PER_POINT)

        if points_earned <= 0:
            return 0

        account = self.db.query(LoyaltyAccount).filter(
            LoyaltyAccount.user_id == user_id
        ).with_for_update().first()

        if not account:
            account = self.get_or_create_account(user_id)

        account.points_balance = (account.points_balance or 0) + points_earned
        account.lifetime_points = (account.lifetime_points or 0) + points_earned

        # Tier upgrade check
        if account.lifetime_points >= GOLD_THRESHOLD and account.tier != "gold":
            account.tier = "gold"
        elif account.lifetime_points >= SILVER_THRESHOLD and account.tier == "plant_lover":
            account.tier = "silver"

        self.db.add(LoyaltyTransaction(
            user_id=user_id,
            type="earned",
            points=points_earned,
            balance_after=account.points_balance,
            description=f"Earned for delivered order {order.order_number}",
            order_id=order.id,
        ))
        return points_earned

    def process_earned_points_post_return_window(self, order: Order) -> int:
        """
        Checks if Order is Delivered AND Return Window (7 days) has expired,
        and if no active return exists, awards Green Points.
        """
        if not order or not order.user_id:
            return 0

        if order.status not in {"delivered", "completed"}:
            return 0

        delivered_at = order.delivered_at or order.updated_at
        if delivered_at and delivered_at.tzinfo is None:
            delivered_at = delivered_at.replace(tzinfo=timezone.utc)

        now = datetime.now(timezone.utc)
        if delivered_at and (now - delivered_at).total_seconds() < RETURN_WINDOW_DAYS * 24 * 60 * 60:
            # Return window not expired yet -> Wait
            return 0

        # Check for active return or refund
        active_return = self.db.query(Return).filter(
            Return.order_id == order.id,
            Return.status.notin_(["rejected"])
        ).first()

        if active_return:
            return 0

        return self.earn_points(order.user_id, order)

    def restore_points_on_refund(self, order: Order, refund_amount: float, is_full_refund: bool = True) -> int:
        """
        Restores used Green Points upon Return & Refund.
        Full refund -> restore all redeemed points.
        Partial refund -> restore points proportionally.
        """
        if not order or not order.user_id or not order.loyalty_points_used:
            return 0

        total_used = order.loyalty_points_used
        order_total = float(order.total)

        if is_full_refund or refund_amount >= order_total:
            points_to_restore = total_used
        else:
            ratio = min(1.0, max(0.0, refund_amount / order_total)) if order_total > 0 else 0.0
            points_to_restore = int(round(total_used * ratio))

        if points_to_restore <= 0:
            return 0

        # Check how many points have already been restored for this order
        previous_restores = self.db.query(LoyaltyTransaction).filter(
            LoyaltyTransaction.order_id == order.id,
            LoyaltyTransaction.type == "reversed",
            LoyaltyTransaction.points > 0
        ).all()
        already_restored = sum(t.points for t in previous_restores)

        points_to_restore = min(points_to_restore, total_used - already_restored)
        if points_to_restore <= 0:
            return 0

        account = self.db.query(LoyaltyAccount).filter(
            LoyaltyAccount.user_id == order.user_id
        ).with_for_update().first()

        if not account:
            return 0

        account.points_balance = (account.points_balance or 0) + points_to_restore

        self.db.add(LoyaltyTransaction(
            user_id=order.user_id,
            type="reversed",
            points=points_to_restore,
            balance_after=account.points_balance,
            description=f"Restored {points_to_restore} Green Points for refunded order {order.order_number}",
            order_id=order.id,
        ))
        return points_to_restore

    def adjust_points(self, user_id: int, points: int, reason: str, admin_id: int) -> None:
        """Admin-initiated manual adjustment."""
        account = self.db.query(LoyaltyAccount).filter(
            LoyaltyAccount.user_id == user_id
        ).with_for_update().first()
        if not account:
            account = self.get_or_create_account(user_id)

        if points < 0 and account.points_balance + points < 0:
            raise ValueError("Adjustment would result in a negative balance.")

        account.points_balance += points
        if points > 0:
            account.lifetime_points += points

        self.sync_tier(account)

        self.db.add(LoyaltyTransaction(

            user_id=user_id,
            type="adjusted",
            points=points,
            balance_after=account.points_balance,
            description=reason,
            adjusted_by=admin_id,
        ))
        self.db.commit()
