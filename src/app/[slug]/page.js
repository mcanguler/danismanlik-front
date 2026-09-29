import { notFound } from "next/navigation";
import { PublicPageView } from "@/components/marketing/public-page-view";
import { fetchPublicPage } from "@/lib/pages";

const SITE_TITLE = "Sümeyra Aydın Akademi & Danışmanlık";

function stripHtml(html) {
  return String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadPage(slug) {
  try {
    return await fetchPublicPage(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await loadPage(slug);

  if (!page) {
    return {
      title: `Sayfa Bulunamadı | ${SITE_TITLE}`,
    };
  }

  const fallbackDescription = stripHtml(page.content).slice(0, 160);

  return {
    title: `${page.seo_title || page.title} | ${SITE_TITLE}`,
    description:
      page.seo_description ||
      fallbackDescription ||
      `${page.title} sayfası.`,
  };
}

export default async function CmsPageRoute({ params }) {
  const { slug } = await params;

  const page = await loadPage(slug);

  if (!page) {
    notFound();
  }

  return <PublicPageView initialPage={page} slug={slug} />;
}
