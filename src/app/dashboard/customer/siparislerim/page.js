"use client";

import { RequireRole } from "@/components/require-role";
import { MyOrders } from "@/components/payments/my-orders";

export default function MyOrdersPage() {
  return (
    <RequireRole role="CUSTOMER">
      <MyOrders />
    </RequireRole>
  );
}
