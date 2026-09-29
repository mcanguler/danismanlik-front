"use client";

import { RequireRole } from "@/components/require-role";
import { CouponsManager } from "@/components/coupons/coupons-manager";

export default function AdminCouponsPage() {
  return (
    <RequireRole role="ADMIN">
      <CouponsManager />
    </RequireRole>
  );
}
