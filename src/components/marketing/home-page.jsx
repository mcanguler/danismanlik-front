"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { EbooksSection } from "@/components/marketing/ebooks-section";
import { CoursesSection } from "@/components/marketing/courses-section";
import { marketingNavLinks } from "@/lib/marketing-nav";
import { MENU_SETTING_SOURCES, useSettingMenuItems } from "@/lib/menus";
import { PRODUCT_TYPES, usePublicProductsQuery } from "@/lib/products";
import { usePublicCoursesQuery } from "@/lib/courses";
import { formatPrice } from "@/lib/format";

function toCardPricing(item) {
  const discount = item.has_discount
    ? `%${Math.round(
        (1 - Number(item.effective_price ?? 0) / Number(item.price)) * 100
      )} İndirim`
    : null;
  return {
    price: formatPrice(item.effective_price ?? item.price),
    oldPrice: item.has_discount ? formatPrice(item.price) : null,
    discount,
  };
}

const FALLBACK_QUICK_LINKS = [
  { label: "1e1 Seanslar", href: null },
  { label: "Atölyeler", href: null },
  { label: "Soru Danışmanlığı", href: null },
];

function QuickLinksSection() {
  const { items, hasItems } = useSettingMenuItems(
    MENU_SETTING_SOURCES.homepage
  );

  const links = hasItems
    ? items.map((item) => ({ label: item.title, href: item.url ?? "#" }))
    : FALLBACK_QUICK_LINKS;

  return (
    <section className="w-full bg-surface-container-low py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/*<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush-surface shadow-sm mb-6">*/}
          {/*  <Sparkles className="size-4 text-accent-gold" />*/}
          {/*  <span className="font-label-sm text-label-sm font-bold uppercase tracking-[0.14em] text-primary-container">*/}
          {/*    Hizmetlerimiz*/}
          {/*  </span>*/}
          {/*</div>*/}
          {/*<h2 className="font-headline-md text-headline-md text-primary font-medium tracking-tight mb-4">*/}
          {/*  Size Nasıl Yardımcı Olabiliriz?*/}
          {/*</h2>*/}
          {/*<p className="font-body-md text-body-md text-on-surface-variant max-w-xl mb-10">*/}
          {/*  Dönüşüm yolculuğunuza uygun olan hizmeti seçin; detaylı bilgi için*/}
          {/*  ekibimiz size yardımcı olsun.*/}
          {/*</p>*/}
          <div className="flex w-full max-w-2xl flex-col gap-4">
            {links.map((link) => {
              const inner = (
                <>
                  <span className="font-title-md text-title-md font-semibold text-primary">
                    {link.label}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-blush-surface px-4 py-1.5 font-label-sm text-label-sm font-semibold text-primary-container transition-colors group-hover:bg-canvas-pure">
                    <span>Detaylı Bilgi</span>
                    <ArrowIcon />
                  </span>
                </>
              );
              const className =
                "group flex w-full items-center justify-between rounded-2xl bg-canvas-pure px-6 py-5 shadow-[0_8px_30px_rgba(92,29,36,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:bg-blush-surface sm:px-8";

              if (link.href) {
                const isExternal = /^https?:\/\//i.test(link.href);
                return isExternal ? (
                  <a
                    className={className}
                    href={link.href}
                    key={link.label}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {inner}
                  </a>
                ) : (
                  <Link className={className} href={link.href} key={link.label}>
                    {inner}
                  </Link>
                );
              }

              return (
                <button className={className} key={link.label} type="button">
                  {inner}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 transition-transform group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function HomePage() {
  const productsQuery = usePublicProductsQuery({
      category: "e-kitaplar",
  });
  const coursesQuery = usePublicCoursesQuery();

  const ebooks = useMemo(() => {
    const products = productsQuery.data ?? [];
    return products
      .map((product) => {
        const hasVariations = (product.variations ?? []).length > 0;
        const hasRequiredFields = (product.fields ?? []).some(
          (field) => field.is_required
        );
        const outOfStock =
          product.type === PRODUCT_TYPES.PHYSICAL && (product.stock ?? 0) <= 0;
        return {
          id: product.id,
          title: product.title,
          image: product.thumbnail,
          slug: product.slug,
          canQuickAdd: !hasVariations && !hasRequiredFields,
          outOfStock,
          ...toCardPricing(product),
        };
      });
  }, [productsQuery.data]);

  const courses = useMemo(() => {
    const courses = coursesQuery.data ?? [];
    return courses
      .filter((course) => course.is_active)
      .map((course) => ({
        id: course.id,
        title: course.title,
        image: course.image,
        slug: course.slug,
        ...toCardPricing(course),
      }));
  }, [coursesQuery.data]);

  return (
    <div className="theme-velvet bg-canvas-cream font-body-md text-on-surface">
      <SiteHeader links={marketingNavLinks("/")} />
      <main className="w-full pt-28 bg-canvas-cream">
        <EbooksSection
          ebooks={ebooks}
          loading={productsQuery.isPending}
        />
        <CoursesSection
          courses={courses}
          loading={coursesQuery.isPending}
        />
        <QuickLinksSection />
      </main>
      <SiteFooter />
    </div>
  );
}
