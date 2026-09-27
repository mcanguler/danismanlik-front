"use client";

import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import {
  BlogListPage,
  BlogPageShell,
} from "@/components/marketing/blog-list-page";

export default function BlogPageRoute() {
  return (
    <Suspense
      fallback={
        <BlogPageShell>
          <div className="flex justify-center py-24">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        </BlogPageShell>
      }
    >
      <BlogListPage />
    </Suspense>
  );
}
