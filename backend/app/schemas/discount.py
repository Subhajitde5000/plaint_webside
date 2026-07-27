from pydantic import BaseModel
from typing import Optional, List, Literal
from decimal import Decimal
from datetime import datetime


class DiscountSchema(BaseModel):
    id: int
    uuid: str
    code: Optional[str] = None
    title: str
    method: str
    discount_type: str
    value: Optional[Decimal] = None
    max_discount_amount: Optional[Decimal] = None
    applies_to: str
    customer_eligibility: str
    min_requirement_type: str
    min_requirement_value: Optional[Decimal] = None
    usage_limit_total: Optional[int] = None
    usage_limit_per_customer: int = 1
    usage_count: int = 0
    combine_with_product: bool = False
    combine_with_order: bool = False
    combine_with_shipping: bool = False
    starts_at: datetime
    ends_at: Optional[datetime] = None
    status: str

    model_config = {"from_attributes": True}


class CreateDiscountRequest(BaseModel):
    code: Optional[str] = None
    title: str
    method: str
    discount_type: str
    value: Optional[Decimal] = None
    max_discount_amount: Optional[Decimal] = None
    applies_to: str = "all"
    customer_eligibility: str = "all"
    min_requirement_type: str = "none"
    min_requirement_value: Optional[Decimal] = None
    usage_limit_total: Optional[int] = None
    usage_limit_per_customer: int = 1
    starts_at: datetime
    ends_at: Optional[datetime] = None
    status: str = "draft"
    exclude_sale_items: bool = False
    min_loyalty_tier: Optional[str] = None
    first_time_only: bool = False
    combine_with_product: bool = False
    combine_with_order: bool = False
    combine_with_shipping: bool = False
    product_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    bogo_config: Optional[dict] = None


class UpdateDiscountRequest(BaseModel):
    code: Optional[str] = None
    title: Optional[str] = None
    method: Optional[str] = None
    discount_type: Optional[str] = None
    value: Optional[Decimal] = None
    max_discount_amount: Optional[Decimal] = None
    usage_limit_total: Optional[int] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    status: Optional[str] = None
    applies_to: Optional[str] = None
    exclude_sale_items: Optional[bool] = None
    customer_eligibility: Optional[str] = None
    min_loyalty_tier: Optional[str] = None
    first_time_only: Optional[bool] = None
    min_requirement_type: Optional[str] = None
    min_requirement_value: Optional[Decimal] = None
    usage_limit_per_customer: Optional[int] = None
    combine_with_product: Optional[bool] = None
    combine_with_order: Optional[bool] = None
    combine_with_shipping: Optional[bool] = None
    product_ids: Optional[List[int]] = None
    collection_ids: Optional[List[int]] = None
    bogo_config: Optional[dict] = None


class ValidateDiscountResponse(BaseModel):
    valid: bool
    discount_type: Optional[str] = None
    discount_amount: Optional[Decimal] = None
    message: str
