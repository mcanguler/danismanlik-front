import { notFound } from "next/navigation";
import { BlogDetailContent } from "@/components/marketing/blog-detail-page";
import { api } from "@/lib/api";

const SITE_TITLE = "Sümeyra Aydın Akademi & Danışmanlık";

async function getPost(slug) {
  try {
    const payload = await api.blogPost(slug);
    const post = payload?.data ?? payload;
    if (!post || typeof post !== "object" || !post.title) return null;
    const category = post.category ?? post.blog_category ?? null;
    return {
      ...post,
      title: post.title,
      slug: post.slug ?? slug,
      thumbnail: post.thumbnail ?? post.image ?? null,
      short_description: post.short_description ?? post.excerpt ?? "",
      content: post.content ?? "",
      seo_title: post.seo_title ?? "",
      seo_description: post.seo_description ?? "",
      published_at: post.published_at ?? null,
      category_name: category?.name ?? null,
      category: category ?? null,
    };
  } catch {
    return null;
  }
}

function stripHtml(html) {
  return String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: `Yazı Bulunamadı | ${SITE_TITLE}`,
    };
  }

  return {
    title: post.seo_title || `${post.title} | ${SITE_TITLE}`,
    description:
      post.seo_description || post.short_description || stripHtml(post.content).slice(0, 160),
    openGraph: {
      title: post.seo_title || post.title,
      description:
        post.seo_description || post.short_description || stripHtml(post.content).slice(0, 160),
      images: post.thumbnail ? [post.thumbnail] : undefined,
      type: "article",
    },
  };
}

export default async function BlogDetailRoute({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailContent post={post} />;
}
