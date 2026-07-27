"""Tests for loyalty service and lifecycle flow."""
import pytest
import uuid
from typing import Tuple
from sqlalchemy.orm import Session

from app.models.loyalty import LoyaltyAccount
from app.models.user import User
from app.services.loyalty_service import LoyaltyService, SILVER_THRESHOLD, GOLD_THRESHOLD


class MockOrder:
    def __init__(self, total=1000.00, order_number="ORD-001", id=1, user_id=1, loyalty_points_used=100):
        self.total = total
        self.order_number = order_number
        self.id = id
        self.user_id = user_id
        self.loyalty_points_used = loyalty_points_used
        self.status = "delivered"
        self.delivered_at = None
        self.updated_at = None


def create_user_and_loyalty(db: Session, user_id: int = 1, points: int = 200) -> Tuple[User, LoyaltyAccount]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            uuid=str(uuid.uuid4()),
            email=f"user{user_id}@example.com",
            password_hash="hash",
            first_name="Test",
            last_name="User",
            is_active=True
        )
        db.add(user)
        db.flush()

    account = db.query(LoyaltyAccount).filter(LoyaltyAccount.user_id == user_id).first()
    if not account:
        account = LoyaltyAccount(user_id=user_id, points_balance=points, points_reserved=0, lifetime_points=points)
        db.add(account)
    else:
        account.points_balance = points
        account.points_reserved = 0

    db.commit()
    return user, account


def test_earn_points_rate(db: Session):
    user, account = create_user_and_loyalty(db, user_id=10, points=0)
    order = MockOrder(total=500.00, id=10, user_id=10)
    svc = LoyaltyService(db)

    earned = svc.earn_points(user.id, order)
    db.commit()
    db.refresh(account)

    # ₹100 = 1 Green Point -> ₹500 actually paid = 5 points
    assert earned == 5
    assert account.points_balance == 5
    assert account.lifetime_points == 5


def test_validate_redemption(db: Session):
    user, account = create_user_and_loyalty(db, user_id=11, points=100)
    svc = LoyaltyService(db)

    # Below min points (min 10)
    valid, msg, discount = svc.validate_redemption(user.id, 5, 500.0)
    assert not valid
    assert "Minimum 10" in msg

    # More than available points (avail 100)
    valid, msg, discount = svc.validate_redemption(user.id, 150, 500.0)
    assert not valid
    assert "Insufficient available" in msg

    # Exceeds max 50% subtotal limit (subtotal=100 -> max 50% = ₹50 = 50 pts)
    valid, msg, discount = svc.validate_redemption(user.id, 80, 100.0)
    assert not valid
    assert "Maximum redemption limit" in msg

    # Valid redemption
    valid, msg, discount = svc.validate_redemption(user.id, 50, 500.0)
    assert valid
    assert discount == 50.0


def test_coupon_combination_rules(db: Session):
    user, account = create_user_and_loyalty(db, user_id=20, points=100)
    svc = LoyaltyService(db)

    # Rule 1: Shipping coupon -> Allowed!
    valid, msg, discount = svc.validate_redemption(user.id, 20, 500.0, discount_type="free_shipping")
    assert valid

    # Rule 2: 25% OFF Coupon -> Blocked!
    valid, msg, discount = svc.validate_redemption(user.id, 20, 500.0, discount_type="percentage", discount_value=25.0)
    assert not valid
    assert "large promotional coupons" in msg

    # Rule 2: BOGO Coupon -> Blocked!
    valid, msg, discount = svc.validate_redemption(user.id, 20, 500.0, discount_type="bogo")
    assert not valid
    assert "BOGO" in msg

    # Rule 2: Flash Sale Code -> Blocked!
    valid, msg, discount = svc.validate_redemption(user.id, 20, 500.0, discount_code="FLASH50")
    assert not valid
    assert "Flash Sale" in msg


def test_minimum_payable_amount_cap(db: Session):
    user, account = create_user_and_loyalty(db, user_id=21, points=100)
    svc = LoyaltyService(db)

    # Order subtotal = 15, user requests 10 points (₹10 off).
    # Final payable total would be ₹5, which is < MIN_PAYABLE_AMOUNT (₹10.00).
    # Thus max allowed discount is ₹5 (max 5 points allowed). Requesting 10 pts should be rejected or capped.
    valid, msg, discount = svc.validate_redemption(user.id, 10, 15.0)
    assert not valid
    assert "Maximum redemption limit" in msg


def test_reserve_and_confirm_points(db: Session):
    user, account = create_user_and_loyalty(db, user_id=12, points=100)
    svc = LoyaltyService(db)
    order = MockOrder(total=1000.0, id=12, user_id=12, loyalty_points_used=30)

    # Step 1: Reserve points
    svc.reserve_points(user.id, 30)
    db.commit()
    db.refresh(account)

    assert account.points_balance == 100
    assert account.points_reserved == 30
    assert account.available_points == 70

    # Step 2: Confirm points on payment
    discount = svc.confirm_redeemed_points(user.id, 30, order)
    db.commit()
    db.refresh(account)

    assert discount == 30.0
    assert account.points_reserved == 0
    assert account.points_balance == 70
    assert account.available_points == 70


def test_release_reserved_points(db: Session):
    user, account = create_user_and_loyalty(db, user_id=13, points=100)
    svc = LoyaltyService(db)

    # Reserve 40 points
    svc.reserve_points(user.id, 40)
    db.commit()
    db.refresh(account)
    assert account.available_points == 60

    # Release on payment failure
    svc.release_reserved_points(user.id, 40)
    db.commit()
    db.refresh(account)
    assert account.points_reserved == 0
    assert account.points_balance == 100
    assert account.available_points == 100


def test_restore_points_on_refund(db: Session):
    user, account = create_user_and_loyalty(db, user_id=14, points=70)
    svc = LoyaltyService(db)
    order = MockOrder(total=1000.0, id=14, user_id=14, loyalty_points_used=30)

    # Full refund -> restores all 30 points
    restored = svc.restore_points_on_refund(order, 1000.0, is_full_refund=True)
    db.commit()
    db.refresh(account)

    assert restored == 30
    assert account.points_balance == 100


def test_tier_upgrades(db: Session):
    user, account = create_user_and_loyalty(db, user_id=15, points=0)
    order = MockOrder(total=50000.0, id=15, user_id=15)  # ₹50,000 = 500 points
    svc = LoyaltyService(db)

    svc.earn_points(user.id, order)
    db.commit()
    db.refresh(account)

    assert account.points_balance == 500
    assert account.tier == "silver"
