/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, ChevronRight, Mail, Search, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { cn } from "@/lib/utils";
import { marketingNavLinks } from "@/lib/marketing-nav";
import { useBlogCategoriesQuery, useBlogPostsQuery } from "@/lib/blog";

export function BlogPageShell({ children }) {
  return (
    <div className="theme-velvet bg-canvas-cream font-body-md text-on-surface">
      <SiteHeader links={marketingNavLinks("/blog")} />
      <main className="w-full pt-28 bg-canvas-cream">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function BlogBreadcrumb({ items }) {
  return (
    <nav
      aria-label="Ekmek Kırıntısı"
      className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span
            className="flex items-center gap-2"
            key={`${item.label}-${index}`}
          >
            {index > 0 && <span className="text-outline-variant">/</span>}
            {item.href && !isLast ? (
              <Link
                className="transition-colors hover:text-primary-container"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast &&
                    "max-w-[280px] truncate font-semibold text-primary-container sm:max-w-none"
                )}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function useBlogListParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const categoryId = searchParams.get("category_id") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const buildHref = (changes) => {
    const next = {
      search,
      category,
      category_id: categoryId,
      page,
      ...changes,
    };
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.category) params.set("category", next.category);
    if (next.category_id) params.set("category_id", next.category_id);
    if (next.page && Number(next.page) !== 1) {
      params.set("page", String(next.page));
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return { search, category, categoryId, page, router, buildHref };
}

export function BlogListHero() {
  return (
    <>
      <section className="w-full relative overflow-hidden pb-4">
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-blush-surface/70 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <BlogBreadcrumb
            items={[
              { label: "Ana Sayfa", href: "/" },
              { label: "Blog & Rehber Yazıları" },
            ]}
          />
        </div>
      </section>
      <section className="w-full pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush-surface shadow-sm mb-6">
            <Sparkles className="size-4 text-accent-gold" />
            <span className="font-label-sm text-label-sm tracking-[0.14em] uppercase text-primary-container font-bold">
              Bilinçli Farkındalık &amp; Dönüşüm Rehberi
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary max-w-4xl tracking-tight leading-[1.15] font-semibold">
            Ruhunuza, İlişkilerinize ve Dişil Özünüze Dair Makaleler
          </h2>
          <p className="mt-4 font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Klinik psikoloji temelli yaklaşımlar, dişil enerji dengesi, sağlıklı
            sınırlar ve ilişki dinamikleri üzerine derinleşen rehber yazılarımız.
          </p>
        </div>
      </section>
    </>
  );
}

export function BlogSearchCard({ search }) {
  const { buildHref, router } = useBlogListParams();
  const [value, setValue] = useState(search);

  return (
    <div className="w-full bg-canvas-pure rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(92,29,36,0.05)] border border-border-delicate">
      <div className="mb-5">
        <h3 className="font-headline-sm text-title-lg text-primary font-bold">
          Yazılarda Ara
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Başlık veya içerikte arama yapın.
        </p>
      </div>
      <form
        className="relative flex items-center"
        onSubmit={(event) => {
          event.preventDefault();
          router.push(buildHref({ search: value.trim() || null, page: null }));
        }}
      >
        <Search className="size-5 text-primary-container absolute left-3.5 pointer-events-none" />
        <input
          className="flex-1 w-full pl-11 pr-24 py-3 rounded-full bg-canvas-cream border border-border-delicate font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/20"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Konu, başlık..."
          type="text"
          value={value}
        />
        <button
          className="absolute right-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-burgundy-light transition-colors"
          type="submit"
        >
          Ara
        </button>
      </form>
    </div>
  );
}

export function BlogCategoriesWidget({ activeCategory, activeCategoryId }) {
  const categoriesQuery = useBlogCategoriesQuery();
  const categories = (categoriesQuery.data ?? []).filter(
    (item) => item.is_active
  );
  const { buildHref } = useBlogListParams();

  return (
    <div>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-delicate">
        <h3 className="font-headline-sm text-title-lg text-primary font-bold">
          Kategoriler
        </h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blush-surface text-primary-container font-medium">
          {categories.length}
        </span>
      </div>
      <ul className="space-y-1.5">
        <li>
          <Link
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-2xl transition-all group font-label-md text-label-md",
              !activeCategory && !activeCategoryId
                ? "bg-primary-container text-on-primary font-label-md text-label-md shadow-md"
                : "text-stone-700 hover:bg-blush-surface/60 hover:text-primary-container"
            )}
            href={buildHref({ category: null, category_id: null, page: null })}
          >
            <span className="font-medium flex items-center gap-2">
              Tüm Yazılar
            </span>
            {!activeCategory && !activeCategoryId && (
              <ChevronRight className="size-4" />
            )}
          </Link>
        </li>
        {categories.map((item) => {
          const isActive =
            (activeCategory && item.slug === activeCategory) ||
            (activeCategoryId && String(item.id) === String(activeCategoryId));
          return (
            <li key={item.id}>
              <Link
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                  isActive
                    ? "bg-primary-container text-on-primary shadow-md"
                    : "text-stone-700 hover:bg-blush-surface/60 hover:text-primary-container"
                )}
                href={buildHref({
                  category: item.slug || null,
                  category_id: item.slug ? null : item.id,
                  page: null,
                })}
              >
                <span className="font-medium text-body-md flex items-center gap-2">
                  {item.name}
                </span>
                {item.posts_count != null && (
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium",
                      isActive
                        ? "bg-white/20 text-on-primary"
                        : "bg-canvas-cream text-on-surface-variant group-hover:bg-blush-surface group-hover:text-primary-container border border-border-delicate"
                    )}
                  >
                    {item.posts_count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BlogNewsletterCta() {
  return (
    <section className="w-full pb-20">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="relative bg-primary-container text-on-primary rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-accent-gold/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-burgundy-light/40 blur-xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-burgundy-light flex items-center justify-center text-accent-gold mb-6 shadow-md">
              <Mail className="size-6" />
            </div>
            <span className="font-label-sm text-label-sm tracking-[0.16em] uppercase text-accent-gold font-bold mb-3">
              Haftalık Dijital Mektup
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-primary tracking-tight mb-4">
              İçsel Yolculuğunuza Her Hafta İlham Katın
            </h2>
            <p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed mb-8 max-w-xl">
              Her Pazar sabahı ilişkiler, dişil zarafet ve bilinçaltı dönüşümü
              üzerine özel rehber mektuplarımızı 35.000+ okurumuzla
              buluşturuyoruz.
            </p>
            <div className="flex items-center gap-2 text-primary-fixed-dim font-label-sm text-label-sm">
              <BadgeCheck className="size-4 text-accent-gold" />
              <span>
                Spam posta gönderilmez. Dilediğiniz an tek tıkla ayrılabilirsiniz.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function readingLabel(post) {
  if (!post?.content) return null;
  const words = String(post.content)
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} dk okuma`;
}

export function formatPostDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function PostCard({ post, featured = false }) {
  return (
    <article
      className={cn(
        "relative w-full bg-canvas-pure rounded-3xl overflow-hidden border border-border-delicate shadow-[0_8px_30px_rgba(92,29,36,0.06)] hover:shadow-xl transition-all duration-300 group flex flex-col",
        featured && "md:col-span-2"
      )}
    >
      <Link className="flex h-full flex-col" href={`/blog/${post.slug}`}>
        <div
          className={cn(
            "relative w-full overflow-hidden flex-shrink-0",
            featured ? "h-72 sm:h-80 md:h-96" : "h-48"
          )}
        >
          {post.thumbnail ? (
            <img
              alt={post.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              src={post.thumbnail}
            />
          ) : (
            <div className="w-full h-full bg-blush-surface flex items-center justify-center">
              <span className="font-headline-md text-headline-md text-primary-container/40">
                {post.title?.slice(0, 1) ?? "?"}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent md:hidden" />
          {post.category_name && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-canvas-pure/95 backdrop-blur-md text-primary-container text-xs font-semibold shadow-sm border border-border-delicate">
              {post.category_name}
            </span>
          )}
        </div>
        <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-secondary mb-3">
              <span className="uppercase font-bold tracking-wider text-primary-container">
                {post.category_name ?? "Blog"}
              </span>
              {readingLabel(post) && (
                <>
                  <span>•</span>
                  <span className="text-on-surface-variant">{readingLabel(post)}</span>
                </>
              )}
              {formatPostDate(post.published_at) && (
                <>
                  <span>•</span>
                  <span className="text-on-surface-variant">
                    {formatPostDate(post.published_at)}
                  </span>
                </>
              )}
            </div>
            <h2
              className={cn(
                "font-headline-md text-primary font-semibold leading-snug mb-3 group-hover:text-burgundy-light transition-colors line-clamp-2",
                featured ? "text-2xl sm:text-3xl" : "text-xl"
              )}
            >
              {post.title}
            </h2>
            {post.short_description && (
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                {post.short_description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border-delicate">
            <span className="text-xs font-semibold text-primary">
              {post.category_name ?? "Blog"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-container hover:text-burgundy-light group-hover:translate-x-1 transition-all">
              Yazıyı Oku
              <ChevronRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          className="rounded-3xl bg-canvas-pure border border-border-delicate overflow-hidden animate-pulse"
          key={index}
        >
          <div className="h-48 bg-blush-surface/60" />
          <div className="p-6 flex flex-col gap-3">
            <div className="h-3 w-1/3 rounded bg-surface-container" />
            <div className="h-5 w-3/4 rounded bg-surface-container" />
            <div className="h-3 w-full rounded bg-surface-container" />
            <div className="h-3 w-2/3 rounded bg-surface-container" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlogListPage() {
  const { search, category, categoryId, page, buildHref } = useBlogListParams();
  const postsQuery = useBlogPostsQuery({
    page,
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
  });

  const items = postsQuery.data?.items ?? [];
  const meta = postsQuery.data?.meta;
  const isPristine = !search && !category && !categoryId && page === 1;
  const featured = isPristine && items.length > 0 ? items[0] : null;
  const gridItems = featured ? items.slice(1) : items;
  const hasFilters = Boolean(search || category || categoryId);

  return (
    <BlogPageShell>
      <BlogListHero />
      <section className="w-full pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-8 w-full">
              {postsQuery.isPending && <ListSkeleton />}

              {postsQuery.isError && (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-6 py-16 text-center">
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    Blog yazıları yüklenemedi.
                  </p>
                  <button
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-md hover:bg-burgundy-light transition-all"
                    onClick={() => postsQuery.refetch()}
                    type="button"
                  >
                    Tekrar Dene
                  </button>
                </div>
              )}

              {postsQuery.isSuccess && items.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-6 py-16 text-center">
                  <Search className="size-8 text-outline-variant" />
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {hasFilters
                      ? "Aramanızla veya seçtiğiniz kategoriyle eşleşen yazı bulunamadı."
                      : "Henüz yayınlanmış bir blog yazısı yok."}
                  </p>
                </div>
              )}

              {postsQuery.isSuccess && items.length > 0 && (
                <div className="flex flex-col gap-8">
                  {featured && <PostCard featured post={featured} />}
                  {gridItems.length > 0 && (
                    <div className="space-y-8 pt-2">
                      <div className="flex items-center justify-between pb-3 border-b border-border-delicate">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-6 rounded-full bg-primary-container" />
                          <h3 className="font-headline-md text-2xl text-primary font-semibold tracking-tight">
                            {hasFilters ? "Sonuçlar" : "Son Yazılar"}
                          </h3>
                        </div>
                        <span className="text-xs font-label-md text-on-surface-variant bg-canvas-pure border border-border-delicate px-3 py-1 rounded-full">
                          {meta ? `${meta.total} yazı` : `${items.length} yazı`}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                        {gridItems.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {meta && meta.lastPage > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  {page > 1 && (
                    <Link
                      className="px-5 py-2.5 rounded-full bg-canvas-pure border border-border-delicate text-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-blush-surface transition-all"
                      href={buildHref({ page: page - 1 })}
                    >
                      Önceki
                    </Link>
                  )}
                  <span className="px-4 py-2 rounded-full bg-canvas-pure border border-border-delicate font-label-md text-label-md text-on-surface-variant">
                    Sayfa {meta.currentPage} / {meta.lastPage}
                  </span>
                  {page < meta.lastPage && (
                    <Link
                      className="px-5 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-md hover:bg-burgundy-light transition-all"
                      href={buildHref({ page: page + 1 })}
                    >
                      Sonraki
                    </Link>
                  )}
                </div>
              )}
            </div>
            <aside className="lg:col-span-4 w-full flex flex-col gap-8 lg:sticky lg:top-28 self-start">
              <BlogSearchCard key={search} search={search} />
              <div className="w-full bg-canvas-pure rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(92,29,36,0.05)] border border-border-delicate">
                <BlogCategoriesWidget
                  activeCategory={category}
                  activeCategoryId={categoryId}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
      <BlogNewsletterCta />
    </BlogPageShell>
  );
}
