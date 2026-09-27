"use client";

import { RequireRole } from "@/components/require-role";
import { BlogCategoryCreatePage } from "@/components/blog/blog-category-form-page";

export default function AdminNewBlogCategoryPage() {
  return (
    <RequireRole role="ADMIN">
      <BlogCategoryCreatePage />
    </RequireRole>
  );
}
