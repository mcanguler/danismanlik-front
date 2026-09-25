"use client";

import { RequireRole } from "@/components/require-role";
import { ProductsManager } from "@/components/products/products-manager";

export default function AdminProductsPage() {
  return (
    <RequireRole role="ADMIN">
      <ProductsManager />
    </RequireRole>
  );
}
