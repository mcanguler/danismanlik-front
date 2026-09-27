"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { BlogEditPage } from "@/components/blog/blog-form-page";
import { useAdminBlogPostQuery } from "@/lib/blog";

export default function AdminBlogPostDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useAdminBlogPostQuery(id);

  return (
    <RequireRole role="ADMIN">
      <BlogEditPage id={id} query={query} />
    </RequireRole>
  );
}
