import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import {
  BlogListPage,
  BlogPageShell,
} from "@/components/marketing/blog-list-page";
import { buildMetadata, getSeoSettings } from "@/lib/seo";

export async function generateMetadata() {
  const seo = await getSeoSettings();
  return buildMetadata({
    title: seo.blogTitle || "Blog",
    description:
      seo.blogDescription ||
      "Kişisel gelişim, ilişki danışmanlığı ve dönüşüm yolculuğu üzerine yazılar.",
    path: "/blog",
  });
}

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
