"use client";

import { use } from "react";
import DiscountForm from "../DiscountForm";

export default function EditDiscountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <DiscountForm discountId={id} />;
}
