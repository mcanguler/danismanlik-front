"use client";

import { RequireRole } from "@/components/require-role";
import { ProductEditPage } from "@/components/products/product-edit-page";

export default function AdminProductDetailPage() {
  return (
    <RequireRole role="ADMIN">
      <ProductEditPage />
    </RequireRole>
  );
}
