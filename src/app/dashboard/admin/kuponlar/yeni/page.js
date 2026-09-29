"use client";

import { RequireRole } from "@/components/require-role";
import { CouponCreatePage } from "@/components/coupons/coupon-form-page";

export default function AdminNewCouponPage() {
  return (
    <RequireRole role="ADMIN">
      <CouponCreatePage />
    </RequireRole>
  );
}
