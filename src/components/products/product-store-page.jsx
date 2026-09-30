/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CircleAlert,
  LoaderCircle,
  Package,
  Search,
  Store,
} from "lucide-react";
import { ServicesPageShell } from "@/components/marketing/services-page";
import { PageTitleSection } from "@/components/marketing/page-title-section";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { ROLES } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";
import { formatPrice } from "@/lib/format";
import {
  useAddCartItem,
  usePublicProductsQuery,
} from "@/lib/products";
import { usePublicProductCategoriesQuery } from "@/lib/products";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

const PAGE_SIZE = 8;

function excerpt(text, maxLength = 110) {
  const value = String(text ?? "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function ProductMedia({ alt, src, className }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-surface-container-highest", className)}>
      {src && !failed ? (
        <img
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setFailed(true)}
          src={src}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-blush-surface text-primary-container">
          <Package className="size-9" />
        </div>
      )}
    </div>
  );
}

function PriceTag({ product, large = false }) {
  if (product.has_discount) {
    return (
      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold text-primary",
            large ? "font-headline-md text-headline-md" : "font-title-sm text-title-sm"
          )}
        >
          {formatPrice(product.effective_price)}
        </span>
        <span className="font-body-sm text-body-sm text-outline line-through">
          {formatPrice(product.price)}
        </span>
      </div>
    );
  }
  return (
    <span
      className={cn(
        "font-bold text-primary",
        large ? "font-headline-md text-headline-md" : "font-title-sm text-title-sm"
      )}
    >
      {formatPrice(product.effective_price)}
    </span>
  );
}

function ProductCard({ product, onAddToCart, adding }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border-delicate bg-canvas-pure shadow-sm hover:shadow-xl transition-all duration-300">
      <Link
        className="relative block aspect-square"
        href={`/urunler/${product.slug || product.id}`}
      >
        <ProductMedia alt={product.title} className="h-full rounded-none" src={product.thumbnail} />
        {product.has_discount && (
          <span className="absolute left-3 top-3 rounded-full bg-accent-gold px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-primary shadow-sm">
            İndirimli
          </span>
        )}
      </Link>
      <div className="flex flex-grow flex-col gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {product.category?.name ? (
            <span className="rounded-full bg-blush-surface px-2 py-0.5 font-label-sm text-label-sm text-primary">
              {product.category.name}
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 font-label-sm text-label-sm text-muted-foreground">
              Kategorisiz
            </span>
          )}
        </div>
        <Link href={`/urunler/${product.slug || product.id}`}>
          <h3 className="font-title-md text-title-md font-semibold leading-snug text-primary transition-colors hover:text-burgundy-light">
            {product.title}
          </h3>
        </Link>
        {product.short_description && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {excerpt(product.short_description, 100)}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <PriceTag product={product} />
          <Button
            className="h-9 rounded-full"
            disabled={adding}
            onClick={() => onAddToCart(product)}
            size="sm"
            type="button"
          >
            {adding ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Store className="size-4" />
            )}
            {adding ? "Ekleniyor..." : "Sepete Ekle"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Sadeleştirme: güven çipleri devre dışı bırakıldı (gerekirse geri açılır)
// const TRUST_CHIPS = [
//   {
//     icon: ShieldCheck,
//     title: "256-Bit SSL",
//     description: "Güvenli ödeme altyapısı",
//   },
//   {
//     icon: Tags,
//     title: "Boutique Seçki",
//     description: "Özenle seçilmiş ürünler",
//   },
//   {
//     icon: BadgeCheck,
//     title: "Web & Mobil",
//     description: "7/24 sipariş takibi",
//   },
//   {
//     icon: Package,
//     title: "Hızlı Teslimat",
//     description: "Onaylı satıcı seçkisi",
//   },
// ];

export function ProductStorePage({ initialProducts = [], initialCategories = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status, user } = useAuth();
  const addCartItem = useAddCartItem();
  const [addingId, setAddingId] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);

  const categorySlug = searchParams.get("category") ?? "";
  // Sunucuda çekilen veri yalnızca aynı kategori filtresiyle eşleşen
  // sorguya başlangıç verisi olarak verilir; filtre değişince taze çekilir.
  const [serverParams] = useState(categorySlug ? { category: categorySlug } : {});
  const currentParams = categorySlug ? { category: categorySlug } : {};
  const paramsMatchServer =
    JSON.stringify(currentParams) === JSON.stringify(serverParams);

  const buildHref = (changes) => {
    const next = { category: categorySlug, ...changes };
    const params = new URLSearchParams();
    if (next.category) params.set("category", next.category);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const selectCategory = (value) => {
    setPage(1);
    router.push(buildHref({ category: value || null }), { scroll: false });
  };

  const onAddToCart = (product) => {
    if (status === "authenticated" && user?.role !== ROLES.CUSTOMER) {
      toast.add({
        title: "Sepete eklenemez",
        description: "Sipariş oluşturmak için müşteri hesabı gereklidir.",
        type: "error",
      });
      return;
    }
    setAddingId(product.id);
    addCartItem.mutate(
      {
        product_id: product.id,
        quantity: 1,
        _snapshot: {
          unitPrice: Number(product.effective_price ?? 0),
          product: {
            id: product.id,
            title: product.title,
            slug: product.slug,
            thumbnail: product.thumbnail,
          },
        },
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Sepete eklendi",
            description: `${product.title} sepetinize eklendi.`,
            type: "success",
          });
        },
        onError: (error) => {
          toast.add({
            title: "Sepete eklenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
        },
        onSettled: () => setAddingId(null),
      }
    );
  };

  const productsQuery = usePublicProductsQuery(currentParams, {
    initialData: paramsMatchServer && initialProducts.length > 0 ? initialProducts : undefined,
  });
  const categoriesQuery = usePublicProductCategoriesQuery({}, {
    initialData: initialCategories.length > 0 ? initialCategories : undefined,
  });
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const visible = useMemo(() => {
    let list = products;
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          (product.short_description ?? "").toLowerCase().includes(query)
      );
    }
    if (sort === "price-asc") {
      list = [...list].sort(
        (a, b) => Number(a.effective_price ?? 0) - Number(b.effective_price ?? 0)
      );
    } else if (sort === "price-desc") {
      list = [...list].sort(
        (a, b) => Number(b.effective_price ?? 0) - Number(a.effective_price ?? 0)
      );
    }
    return list;
  }, [products, search, sort]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const clearAll = () => {
    setSearch("");
    setSort("default");
    setPage(1);
    if (categorySlug) {
      router.push(pathname, { scroll: false });
    }
  };

  return (
    <ServicesPageShell>
      <PageTitleSection title="Ürünler" />

      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
        <div className="rounded-3xl border border-border-delicate bg-canvas-pure p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-xl border border-input bg-canvas-cream pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Ürün adı, türü veya anahtar kelime ara..."
                type="text"
                value={search}
              />
            </div>
            <select
              className="h-10 rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              value={sort}
            >
              <option value="default">Sıralama: Varsayılan</option>
              <option value="price-asc">Fiyat: Artan</option>
              <option value="price-desc">Fiyat: Azalan</option>
            </select>
            <Button
              className="h-10 rounded-xl"
              onClick={clearAll}
              type="button"
              variant="outline"
            >
              Temizle
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className={cn(
                "rounded-full px-4 py-1.5 font-label-md text-label-md font-semibold transition-colors",
                categorySlug === ""
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "bg-blush-surface text-primary hover:bg-blush-hover"
              )}
              onClick={() => selectCategory("")}
              type="button"
            >
              Tümü
            </button>
            {categories.map((category) => (
              <button
                className={cn(
                  "rounded-full px-4 py-1.5 font-label-md text-label-md font-semibold transition-colors",
                  categorySlug === category.slug
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "bg-blush-surface text-primary hover:bg-blush-hover"
                )}
                key={category.id}
                onClick={() => selectCategory(category.slug)}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>
          {/* Sadeleştirme: aktif seçim etiketleri kaldırıldı */}
          {/* {(categorySlug || search.trim() || sort !== "default") && (
            <div className="mt-3 flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-muted-foreground">
              <span>Aktif Seçim:</span>
              {categorySlug && (
                <span className="rounded-full bg-primary-container px-2.5 py-0.5 font-medium text-on-primary">
                  Kategori:{" "}
                  {categories.find((c) => c.slug === categorySlug)?.name ?? "—"}
                </span>
              )}
              {search.trim() && (
                <span className="rounded-full bg-primary-container px-2.5 py-0.5 font-medium text-on-primary">
                  Arama: {search.trim()}
                </span>
              )}
            </div>
          )} */}
        </div>
      </div>

      <div className="w-full py-12">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-border-delicate pb-3">
            <h2 className="font-headline-md text-headline-md font-semibold text-primary">
              Katalog
            </h2>
            <span className="whitespace-nowrap font-label-md text-label-md text-on-surface-variant">
              {visible.length} ürün listeleniyor
            </span>
          </div>

          {productsQuery.isPending && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  className="flex flex-col gap-4 rounded-3xl border border-border-delicate bg-canvas-pure p-4"
                  key={index}
                >
                  <div className="aspect-square w-full animate-pulse rounded-2xl bg-surface-container-highest" />
                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-surface-container-highest" />
                  <div className="h-8 w-28 animate-pulse rounded-xl bg-surface-container-highest" />
                </div>
              ))}
            </div>
          )}

          {productsQuery.isError && (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-14 text-center">
              <CircleAlert className="size-7 text-destructive" />
              <p className="font-body-md text-body-md text-on-surface-variant">
                Ürünler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
              </p>
            </div>
          )}

          {productsQuery.isSuccess && products.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-14 text-center">
              <Package className="size-8 text-accent-gold" />
              <p className="font-title-md text-title-md font-semibold text-primary">
                Şu anda satışta ürün bulunmuyor
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Yeni ürünler için kısa süre içinde tekrar ziyaret edin.
              </p>
            </div>
          )}

          {products.length > 0 && visible.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-outline-variant px-4 py-14 text-center">
              <Search className="size-7 text-accent-gold" />
              <p className="font-title-md text-title-md font-semibold text-primary">
                Ürün bulunamadı
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Aramanızı veya kategori filtresini değiştirip tekrar deneyin.
              </p>
              <Button onClick={clearAll} variant="outline">
                Filtreleri Temizle
              </Button>
            </div>
          )}

          {visible.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {pageItems.map((product) => (
                  <ProductCard
                    adding={productsQuery.isFetching && addingId === product.id}
                    key={product.id}
                    onAddToCart={onAddToCart}
                    product={product}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  <Button
                    disabled={currentPage <= 1}
                    onClick={() => setPage((current) => current - 1)}
                    size="sm"
                    variant="outline"
                  >
                    Önceki
                  </Button>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <Button
                      key={index}
                      onClick={() => setPage(index + 1)}
                      size="sm"
                      variant={currentPage === index + 1 ? "default" : "outline"}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                    size="sm"
                    variant="outline"
                  >
                    Sonraki
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ServicesPageShell>
  );
}
