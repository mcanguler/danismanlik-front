"use client";

import { RequireRole } from "@/components/require-role";
import { ProductCategoryCreatePage } from "@/components/product-categories/product-category-form-page";

export default function AdminNewProductCategoryPage() {
  return (
    <RequireRole role="ADMIN">
      <ProductCategoryCreatePage />
    </RequireRole>
  );
}
