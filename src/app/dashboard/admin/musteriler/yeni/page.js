"use client";

import { RequireRole } from "@/components/require-role";
import { CustomerCreatePage } from "@/components/customers/customer-form-page";

export default function AdminNewCustomerPage() {
  return (
    <RequireRole role="ADMIN">
      <CustomerCreatePage />
    </RequireRole>
  );
}
