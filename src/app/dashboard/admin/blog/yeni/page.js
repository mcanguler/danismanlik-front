"use client";

import { RequireRole } from "@/components/require-role";
import { BlogCreatePage } from "@/components/blog/blog-form-page";

export default function AdminNewBlogPostPage() {
  return (
    <RequireRole role="ADMIN">
      <BlogCreatePage />
    </RequireRole>
  );
}
