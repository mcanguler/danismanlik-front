import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { ServicesPageShell } from "@/components/marketing/services-page";
import { api, ApiError } from "@/lib/api";

const SITE_TITLE = "Sümeyra Aydın Akademi & Danışmanlık";

async function getPage(slug) {
  try {
    const payload = await api.publicPage(slug);
    const page = payload?.data ?? payload;
    if (!page || typeof page !== "object" || !page.title) return null;
    return page;
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
  const page = await getPage(slug);

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
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <ServicesPageShell>
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <nav className="mb-8 flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant">
          <Link className="transition-colors hover:text-primary-container" href="/">
            Anasayfa
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="max-w-xs truncate font-semibold text-primary-container">
            {page.title}
          </span>
        </nav>

        <article className="overflow-hidden rounded-3xl border border-border-delicate bg-canvas-pure shadow-[0_12px_32px_-4px_rgba(92,29,36,0.06)]">
          <header className="border-b border-border-delicate bg-blush-surface/40 px-6 py-8 sm:px-10">
            <p className="font-label-sm text-label-sm font-bold uppercase tracking-[0.14em] text-secondary">
              Kurumsal &amp; Yasal
            </p>
            <h1 className="mt-3 font-headline-lg text-headline-lg font-medium tracking-tight text-primary">
              {page.title}
            </h1>
            {page.seo_description && (
              <p className="mt-3 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                {page.seo_description}
              </p>
            )}
          </header>
          <div className="p-6 sm:p-10">
            {page.content ? (
              <div
                className="prose prose-sm max-w-none font-body-md text-body-md leading-relaxed text-on-surface-variant [&_h1]:font-headline-md [&_h1]:text-headline-md [&_h1]:font-semibold [&_h1]:text-primary [&_h2]:font-headline-sm [&_h2]:text-headline-sm [&_h2]:font-semibold [&_h2]:text-primary [&_h3]:font-title-lg [&_h3]:text-title-lg [&_h3]:font-semibold [&_h3]:text-primary [&_strong]:text-primary [&_a]:text-primary-container [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <p className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant">
                <CircleAlert className="size-4 text-accent-gold" />
                Bu sayfa için henüz içerik yayınlanmadı.
              </p>
            )}
            <p className="mt-10 border-t border-border-delicate pt-4 text-xs text-muted-foreground">
              Son güncelleme:{" "}
              {page.updated_at
                ? new Date(page.updated_at).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </article>
      </div>
    </ServicesPageShell>
  );
}
