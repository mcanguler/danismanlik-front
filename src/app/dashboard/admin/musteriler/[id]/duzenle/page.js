"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { CustomerEditPage } from "@/components/customers/customer-form-page";
import { useCustomerQuery } from "@/lib/customers";

export default function AdminCustomerEditPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useCustomerQuery(id);

  return (
    <RequireRole role="ADMIN">
      <CustomerEditPage id={id} query={query} />
    </RequireRole>
  );
}
