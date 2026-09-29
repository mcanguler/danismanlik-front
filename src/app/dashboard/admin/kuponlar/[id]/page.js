"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { CouponEditPage } from "@/components/coupons/coupon-form-page";
import { useAdminCouponQuery } from "@/lib/coupons";

export default function AdminCouponDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useAdminCouponQuery(id);

  return (
    <RequireRole role="ADMIN">
      <CouponEditPage id={id} query={query} />
    </RequireRole>
  );
}
