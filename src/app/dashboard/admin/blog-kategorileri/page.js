"use client";

import { RequireRole } from "@/components/require-role";
import { BlogCategoriesManager } from "@/components/blog/blog-categories-manager";

export default function AdminBlogCategoriesPage() {
  return (
    <RequireRole role="ADMIN">
      <BlogCategoriesManager />
    </RequireRole>
  );
}
