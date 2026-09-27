"use client";

import { RequireRole } from "@/components/require-role";
import { BlogCommentsManager } from "@/components/blog/blog-comments-manager";

export default function AdminBlogCommentsPage() {
  return (
    <RequireRole role="ADMIN">
      <BlogCommentsManager />
    </RequireRole>
  );
}
