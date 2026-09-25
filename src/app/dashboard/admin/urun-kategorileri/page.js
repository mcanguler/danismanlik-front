"use client";

import { RequireRole } from "@/components/require-role";
import { ProductCategoriesManager } from "@/components/product-categories/product-categories-manager";

export default function AdminProductCategoriesPage() {
  return (
    <RequireRole role="ADMIN">
      <ProductCategoriesManager />
    </RequireRole>
  );
}
