"use client";

import { RequireRole } from "@/components/require-role";
import { ProductCreatePage } from "@/components/products/product-create-page";

export default function AdminNewProductPage() {
  return (
    <RequireRole role="ADMIN">
      <ProductCreatePage />
    </RequireRole>
  );
}
