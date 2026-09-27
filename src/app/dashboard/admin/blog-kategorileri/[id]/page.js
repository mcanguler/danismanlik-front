"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { BlogCategoryEditPage } from "@/components/blog/blog-category-form-page";

export default function AdminBlogCategoryDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <BlogCategoryEditPage id={id} />
    </RequireRole>
  );
}
