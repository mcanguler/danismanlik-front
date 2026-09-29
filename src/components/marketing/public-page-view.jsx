"use client";

import Link from "next/link";
import { ChevronRight, CircleAlert, LoaderCircle } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { marketingNavLinks } from "@/lib/marketing-nav";
import { useHeaderMenuLinks } from "@/lib/menus";
import { useSettingsQuery } from "@/lib/settings";
import { formatPageDate } from "@/lib/format";
import { usePublicPageQuery } from "@/lib/pages";

const SITE_NAME = "Sümeyra Aydın";

export function PublicPageView({ slug, initialPage = null }) {
  const settingsQuery = useSettingsQuery();
  const { links, isLoading: isNavLoading } = useHeaderMenuLinks(
    marketingNavLinks(undefined)
  );
  const pageQuery = usePublicPageQuery(slug, {
    enabled: initialPage == null,
  });

  const page = initialPage ?? pageQuery.data;
  const isLoading = initialPage == null && pageQuery.isPending;
  const isError = initialPage == null && pageQuery.isError;

  if (isLoading) {
    return (
      <div className="theme-velvet min-h-screen bg-canvas-cream font-body-md text-on-surface">
        <SiteHeader links={isNavLoading ? [] : links} />
        <main className="flex w-full items-center justify-center pt-40 pb-24">
          <LoaderCircle className="size-7 animate-spin text-muted-foreground" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="theme-velvet min-h-screen bg-canvas-cream font-body-md text-on-surface">
        <SiteHeader links={isNavLoading ? [] : links} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-40 text-center sm:px-6">
          <CircleAlert className="mx-auto size-10 text-accent-gold" />
          <h1 className="mt-4 font-headline-md text-headline-md font-semibold text-primary">
            Sayfa bulunamadı
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aradığınız sayfa yayından kaldırılmış veya hiç oluşturulmamış olabilir.
          </p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary-container px-8 py-3 font-label-lg text-label-lg text-on-primary shadow-lg transition-all hover:bg-burgundy-light"
            href="/"
          >
            Anasayfaya Dön
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const siteName = settingsQuery.data?.["site_name"] || SITE_NAME;

  return (
    <div className="theme-velvet min-h-screen bg-canvas-cream font-body-md text-on-surface">
      <SiteHeader links={isNavLoading ? [] : links} />
      <main className="w-full pt-28">
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
          <nav className="mb-8 flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <Link className="transition-colors hover:text-primary-container" href="/">
              Anasayfa
            </Link>
            <ChevronRight className="size-4 text-outline-variant" />
            <span className="max-w-xs truncate font-semibold text-primary-container">
              {page.title}
            </span>
          </nav>

          <article className="overflow-hidden rounded-3xl border border-border-delicate bg-canvas-pure shadow-[0_12px_32px_-4px_rgba(92,29,36,0.06)]">
            <header className="border-b border-border-delicate bg-blush-surface/40 px-6 py-8 sm:px-10">
              <p className="font-label-sm text-label-sm font-bold uppercase tracking-[0.14em] text-secondary">
                {siteName}
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
                Son güncelleme: {formatPageDate(page.updated_at)}
              </p>
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
