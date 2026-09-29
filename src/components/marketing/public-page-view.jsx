"use client";

import Link from "next/link";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PageTitleSection } from "@/components/marketing/page-title-section";
import { marketingNavLinks } from "@/lib/marketing-nav";
import { useHeaderMenuLinks } from "@/lib/menus";
import { formatPageDate } from "@/lib/format";
import { usePublicPageQuery } from "@/lib/pages";

export function PublicPageView({ slug, initialPage = null }) {
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

  return (
    <div className="theme-velvet min-h-screen bg-canvas-cream font-body-md text-on-surface">
      <SiteHeader links={isNavLoading ? [] : links} />
      <main className="w-full pt-28">
        <PageTitleSection title={page.title} />

        <section className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
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
            <p className="mt-12 border-t border-border-delicate pt-4 text-center text-xs text-muted-foreground">
              Son güncelleme: {formatPageDate(page.updated_at)}
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
