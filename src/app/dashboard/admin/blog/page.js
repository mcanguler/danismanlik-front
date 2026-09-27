"use client";

import { RequireRole } from "@/components/require-role";
import { BlogManager } from "@/components/blog/blog-manager";

export default function AdminBlogPage() {
  return (
    <RequireRole role="ADMIN">
      <BlogManager />
    </RequireRole>
  );
}
