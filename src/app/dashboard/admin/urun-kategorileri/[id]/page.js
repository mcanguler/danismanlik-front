"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ProductCategoryEditPage } from "@/components/product-categories/product-category-form-page";
import { useProductCategoryQuery } from "@/lib/products";

export default function AdminProductCategoryDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useProductCategoryQuery(id);

  return (
    <RequireRole role="ADMIN">
      <ProductCategoryEditPage id={id} query={query} />
    </RequireRole>
  );
}
