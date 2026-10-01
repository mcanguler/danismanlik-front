"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CircleAlert,
  LoaderCircle,
  Package,
  Search,
} from "lucide-react";
import { ServicesPageShell } from "@/components/marketing/services-page";
import { PageTitleSection } from "@/components/marketing/page-title-section";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { isApiError } from "@/lib/query-errors";
import { ROLES } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";
import {
  remainingPurchaseQuantity,
  useAddCartItem,
  useCartQuery,
  usePublicProductCategoriesQuery,
  usePublicProductsQuery,
} from "@/lib/products";
import { useOrdersQuery } from "@/lib/orders";

function getErrorMessage(error) {
  if (isApiError(error)) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

const PAGE_SIZE = 8;

export function ProductStorePage({ initialProducts = [], initialCategories = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status, user } = useAuth();
  const addCartItem = useAddCartItem();
  const cartQuery = useCartQuery({ enabled: status !== "loading" });
  const ordersQuery = useOrdersQuery({
    enabled: status === "authenticated",
  });
  const [addingId, setAddingId] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);

  const categorySlug = searchParams.get("category") ?? "";
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
    const remaining = remainingPurchaseQuantity({
      product,
      cartItems: cartQuery.data?.items ?? [],
      orders: ordersQuery.data ?? [],
    });
    if (remaining != null && remaining < 1) {
      toast.add({
        title: "Alım limiti doldu",
        description: `Bu üründen en fazla ${product.max_purchase_quantity} adet satın alabilirsiniz.`,
        type: "info",
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
            max_purchase_quantity: product.max_purchase_quantity ?? null,
            fields: product.fields ?? [],
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

  const activeCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : null;

  const clearAll = () => {
    setSearch("");
    setSort("default");
    setPage(1);
    router.push(pathname, { scroll: false });
  };

  return (
    <ServicesPageShell>
      <PageTitleSection
        description="Boutique ürün koleksiyonunu keşfedin; güvenli ödeme altyapısıyla sipariş verin."
        title={activeCategory?.name ?? "Ürünler"}
      />
      <div className="mx-auto w-full max-w-[1320px] px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-border-delicate bg-canvas-pure p-4 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-11 w-full rounded-xl border-0 bg-surface-container-low pl-10 pr-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Ürün ara..."
                type="search"
                value={search}
              />
            </div>
            <select
              className="h-11 rounded-xl border-0 bg-surface-container-low px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              value={sort}
            >
              <option value="default">Sıralama</option>
              <option value="price-asc">Fiyat (artan)</option>
              <option value="price-desc">Fiyat (azalan)</option>
            </select>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                className={cn(
                  "rounded-full px-4 py-1.5 font-label-md text-label-md transition-colors",
                  !categorySlug
                    ? "bg-primary text-on-primary"
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
                    "rounded-full px-4 py-1.5 font-label-md text-label-md transition-colors",
                    categorySlug === category.slug
                      ? "bg-primary text-on-primary"
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
          )}

          {(productsQuery.isPending || categoriesQuery.isPending) && (
            <div className="flex justify-center py-16">
              <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {(productsQuery.isError || categoriesQuery.isError) && (
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
                Şu anda listelenen ürün yok
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
