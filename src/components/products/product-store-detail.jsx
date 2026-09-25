/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  CircleAlert,
  GraduationCap,
  Layers,
  LoaderCircle,
  Package,
  ShieldCheck,
  Store,
  Tags,
} from "lucide-react";
import { ServicesPageShell } from "@/components/marketing/services-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { ROLES } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";
import { toast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/format";
import {
  PRODUCT_FIELD_TYPES,
  PRODUCT_TYPES,
  isOptionBasedFieldType,
  useAddCartItem,
  useCheckoutCart,
  usePublicProductQuery,
  usePublicProductsQuery,
} from "@/lib/products";

const CARD_CTA_CLASS =
  "inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-burgundy-light shadow-md transition-all";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function resolveProductFromList(products, param) {
  const value = String(param ?? "").toLowerCase();
  return (
    products.find((product) => String(product.slug) === value) ??
    products.find((product) => String(product.id) === value) ??
    null
  );
}

function FieldInput({ field, value, onChange }) {
  if (field.type === PRODUCT_FIELD_TYPES.INPUT) {
    return (
      <Input
        id={`field_${field.key}`}
        maxLength={500}
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={field.is_required ? "Zorunlu alan" : "Opsiyonel"}
        type="text"
        value={value ?? ""}
      />
    );
  }

  if (field.type === PRODUCT_FIELD_TYPES.SELECT) {
    return (
      <select
        className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        id={`field_${field.key}`}
        onChange={(event) => onChange(field, event.target.value)}
        value={value ?? ""}
      >
        <option value="">Seçin</option>
        {(field.options ?? []).map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const options = field.options ?? [];

  if (field.type === PRODUCT_FIELD_TYPES.RADIO) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              value === String(option.id)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:bg-accent"
            )}
            key={option.id}
            onClick={() => onChange(field, value === String(option.id) ? "" : String(option.id))}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = (value ?? []).includes(String(option.id));
        return (
          <button
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:bg-accent"
            )}
            key={option.id}
            onClick={() => {
              const current = value ?? [];
              const next = selected
                ? current.filter((item) => item !== String(option.id))
                : [...current, String(option.id)];
              onChange(field, next);
            }}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function PurchasePanel({ product, relatedCount = 0 }) {
  const router = useRouter();
  const { status, user } = useAuth();
  const addCartItem = useAddCartItem();
  const checkoutCart = useCheckoutCart();

  const variations = product.variations ?? [];
  const hasVariations = variations.length > 0 && product.type === PRODUCT_TYPES.PHYSICAL;

  const [quantity, setQuantity] = useState(1);
  const [variationId, setVariationId] = useState(
    hasVariations ? String(variations[0]?.id ?? "") : ""
  );
  const [optionValues, setOptionValues] = useState({});
  const [pending, setPending] = useState(false);

  const selectedVariation = hasVariations
    ? variations.find((variation) => String(variation.id) === String(variationId)) ?? null
    : null;

  const price = formatPrice(
    selectedVariation ? selectedVariation.effective_price : product.effective_price
  );
  const originalPrice = (selectedVariation
    ? selectedVariation.has_discount
      ? selectedVariation.price
      : null
    : product.has_discount
      ? product.price
      : null);

  const stock = selectedVariation ? selectedVariation.stock : product.stock;
  const isDigital = product.type === PRODUCT_TYPES.DIGITAL;

  const requiredMissing = useMemo(
    () =>
      (product.fields ?? []).some((field) => {
        if (!field.is_required) return false;
        const value = optionValues[field.key];
        if (isOptionBasedFieldType(field.type)) {
          if (field.type === PRODUCT_FIELD_TYPES.CHECKBOX) {
            return !Array.isArray(value) || value.length === 0;
          }
          return value == null || value === "";
        }
        return !value || String(value).trim() === "";
      }),
    [product.fields, optionValues]
  );

  const setFieldValue = (field, value) => {
    setOptionValues((current) => ({ ...current, [field.key]: value }));
  };

  const buildPayload = () => {
    const payload = {
      product_id: product.id,
      quantity,
    };
    if (selectedVariation) {
      payload.variation_id = selectedVariation.id;
    }
    const selectedOptions = {};
    for (const field of product.fields ?? []) {
      const value = optionValues[field.key];
      if (value == null) continue;
      if (Array.isArray(value)) {
        if (value.length > 0) {
          selectedOptions[field.key] = value.map((item) => Number(item));
        }
        continue;
      }
      if (String(value).trim() !== "") {
        selectedOptions[field.key] = field.type === PRODUCT_FIELD_TYPES.INPUT
          ? String(value).trim()
          : Number(value);
      }
    }
    if (Object.keys(selectedOptions).length > 0) {
      payload.selected_options = selectedOptions;
    }
    return payload;
  };

  const addToCart = async () => {
    const payload = buildPayload();
    const item = await addCartItem.mutateAsync(payload);
    return item;
  };

  const handleAddToCart = () => {
    if (status === "unauthenticated") {
      toast.add({
        title: "Giriş gerekli",
        description: "Sipariş oluşturmak için lütfen giriş yapın.",
        type: "info",
      });
      router.push("/login");
      return;
    }
    if (user?.role !== ROLES.CUSTOMER) {
      toast.add({
        title: "Sipariş oluşturulamaz",
        description: "Sipariş oluşturmak için müşteri hesabı gereklidir.",
        type: "error",
      });
      return;
    }
    if (requiredMissing) {
      toast.add({
        title: "Eksik alanlar var",
        description: "Lütfen zorunlu seçenekleri doldurun.",
        type: "error",
      });
      return;
    }
    setPending(true);
    addToCart()
      .then(() => {
        toast.add({
          title: "Sepete eklendi",
          description: `${product.title} sepetinize eklendi.`,
          type: "success",
        });
      })
      .catch((error) => {
        toast.add({
          title: "Sepete eklenemedi",
          description: getErrorMessage(error),
          type: "error",
        });
      })
      .finally(() => setPending(false));
  };

  const handleBuyNow = () => {
    if (status === "unauthenticated") {
      toast.add({
        title: "Giriş gerekli",
        description: "Sipariş oluşturmak için lütfen giriş yapın.",
        type: "info",
      });
      router.push("/login");
      return;
    }
    if (user?.role !== ROLES.CUSTOMER) {
      toast.add({
        title: "Sipariş oluşturulamaz",
        description: "Sipariş oluşturmak için müşteri hesabı gereklidir.",
        type: "error",
      });
      return;
    }
    if (requiredMissing) {
      toast.add({
        title: "Eksik alanlar var",
        description: "Lütfen zorunlu seçenekleri doldurun.",
        type: "error",
      });
      return;
    }
    setPending(true);
    addToCart()
      .then(() => checkoutCart.mutateAsync())
      .then((order) => {
        router.push(`/odeme/${order.id}`);
      })
      .catch((error) => {
        toast.add({
          title: "Sipariş oluşturulamadı",
          description: getErrorMessage(error),
          type: "error",
        });
        setPending(false);
      });
  };

  return (
    <div className="rounded-3xl border border-border-delicate bg-canvas-pure p-6 shadow-[0_12px_32px_-4px_rgba(92,29,36,0.06)]">
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
          Fiyat
        </span>
        <div className="flex items-baseline gap-2.5">
          <span className="font-headline-lg text-headline-lg font-bold text-primary">
            {price}
          </span>
          {originalPrice && (
            <span className="font-body-md text-body-md text-outline line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        {product.has_discount && (
          <span className="w-fit rounded-full bg-accent-gold px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-primary">
            İndirimli Fiyat
          </span>
        )}
      </div>

      {hasVariations && (
        <div className="mt-5 flex flex-col gap-1.5">
          <Label className="font-label-md text-label-md" htmlFor="variation_select">
            Varyasyon
          </Label>
          <select
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            id="variation_select"
            onChange={(event) => setVariationId(event.target.value)}
            value={variationId}
          >
            {variations.map((variation) => (
              <option key={variation.id} value={variation.id}>
                {(variation.options ?? []).map((option) => option.label).join(" / ")}
                {` · ${formatPrice(variation.effective_price)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {(product.fields ?? []).length > 0 && (
        <div className="mt-5 flex flex-col gap-4">
          <p className="font-label-md text-label-md font-semibold uppercase tracking-wider text-secondary">
            Seçenekler
          </p>
          {(product.fields ?? []).map((field) => (
            <div className="flex flex-col gap-1.5" key={field.id}>
              <Label htmlFor={`field_${field.key}`}>
                {field.name}
                {field.is_required && <span className="text-destructive"> *</span>}
              </Label>
              <FieldInput
                field={field}
                onChange={setFieldValue}
                value={optionValues[field.key]}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <Label className="shrink-0 font-label-md text-label-md" htmlFor="quantity_input">
          Adet
        </Label>
        <Input
          className="h-10 w-24"
          id="quantity_input"
          inputMode="numeric"
          max={100}
          min={1}
          onChange={(event) => {
            const value = Number(event.target.value);
            setQuantity(Number.isInteger(value) && value > 0 ? value : 1);
          }}
          step="1"
          type="number"
          value={quantity}
        />
        {!isDigital && (
          <span className="font-body-sm text-body-sm text-muted-foreground">
            {stock > 0 ? `Stok: ${stock}` : "Stokta yok"}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button
          className="h-12 w-full rounded-full text-base"
          disabled={pending || (!isDigital && stock <= 0)}
          onClick={handleAddToCart}
          type="button"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Store className="size-4" />
          )}
          {pending ? "İşleniyor..." : "Sepete Ekle"}
        </Button>
        <Button
          className="h-12 w-full rounded-full text-base"
          disabled={pending || (!isDigital && stock <= 0)}
          onClick={handleBuyNow}
          type="button"
          variant="outline"
        >
          <ChevronRight className="size-4" />
          Hemen Satın Al
        </Button>
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-label-sm text-label-sm text-muted-foreground">
        <ShieldCheck className="size-3.5" />
        Ödemeniz PayTR altyapısı ile 256-Bit SSL şifrelemeyle korunur.
      </p>
    </div>
  );
}

export function ProductStoreDetail({ slug }) {
  const listQuery = usePublicProductsQuery();
  const products = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const productSummary = resolveProductFromList(products, slug);
  const detailQuery = usePublicProductQuery(productSummary?.id, {
    enabled: productSummary != null,
  });
  const product = detailQuery.data;

  const related = useMemo(() => {
    if (!product) return [];
    const categoryId = product.product_category_id;
    return products
      .filter((item) => item.id !== product.id)
      .filter((item) => categoryId != null && item.product_category_id === categoryId)
      .slice(0, 3);
  }, [product, products]);

  return (
    <ServicesPageShell>
      {listQuery.isPending && (
        <div className="mx-auto w-full max-w-[1320px] px-4 py-20 sm:px-6">
          <div className="flex justify-center">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}

      {listQuery.isSuccess && !productSummary && (
        <div className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-16 text-center">
            <Package className="size-8 text-accent-gold" />
            <p className="font-title-md text-title-md font-semibold text-primary">
              Ürün bulunamadı
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Aradığınız ürün mevcut değil veya satıştan kaldırılmış olabilir.
            </p>
            <Link className={cn(CARD_CTA_CLASS, "mt-2")} href="/urunler">
              Tüm Ürünleri Görüntüle
            </Link>
          </div>
        </div>
      )}

      {productSummary && (
        <div className="py-10">
          <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
            {detailQuery.isPending && (
              <div className="flex justify-center py-16">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {detailQuery.isError && (
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-14 text-center">
                <CircleAlert className="size-7 text-destructive" />
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Ürün detayı yüklenemedi. Lütfen tekrar deneyin.
                </p>
              </div>
            )}
            {product && (
              <>
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                  <div className="flex flex-col gap-4">
                    <div className="relative overflow-hidden rounded-3xl border border-border-delicate bg-surface-container-highest">
                      {product.thumbnail ? (
                        <img
                          alt={product.title}
                          className="aspect-square w-full object-cover"
                          src={product.thumbnail}
                        />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center bg-blush-surface text-primary-container">
                          <Package className="size-12" />
                        </div>
                      )}
                      {product.has_discount && (
                        <span className="absolute left-4 top-4 rounded-full bg-accent-gold px-3 py-1 font-label-sm text-label-sm font-bold text-primary shadow-sm">
                          İndirimli
                        </span>
                      )}
                    </div>
                    {(product.gallery ?? []).length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {product.gallery.slice(0, 8).map((image) => (
                          <div
                            className="overflow-hidden rounded-xl border border-border-delicate bg-surface-container-highest"
                            key={image.id}
                          >
                            <img
                              alt={product.title}
                              className="aspect-square w-full object-cover"
                              loading="lazy"
                              src={image.image}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {product.category?.name && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blush-surface px-3.5 py-1 font-label-sm text-label-sm font-bold text-primary">
                          <Tags className="size-3.5 text-accent-gold" />
                          {product.category.name}
                        </span>
                      )}
                      <span className="rounded-full bg-muted px-3 py-1 font-label-sm text-label-sm text-muted-foreground">
                        {product.type === PRODUCT_TYPES.DIGITAL ? "Dijital Ürün" : "Fiziksel Ürün"}
                      </span>
                    </div>
                    <h1 className="font-headline-md text-headline-md font-medium leading-tight tracking-tight text-primary">
                      {product.title}
                    </h1>
                    {product.short_description && (
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        {product.short_description}
                      </p>
                    )}
                    <PurchasePanel product={product} />
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-delicate bg-canvas-pure px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-primary-container" />
                        256-Bit SSL güvenli ödeme
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BadgeCheck className="size-4 text-primary-container" />
                        Sipariş takibi
                      </span>
                    </div>
                  </div>
                </div>

                {(product.description || product.content) && (
                  <section className="mt-14 rounded-3xl border border-border-delicate bg-canvas-pure p-6 sm:p-10">
                    <div className="mb-4 flex items-center gap-2 font-label-md text-label-md font-semibold uppercase tracking-[0.08em] text-secondary">
                      <Layers className="size-4" />
                      <span>Ürün Hakkında</span>
                    </div>
                    <div
                      className="prose prose-sm max-w-none font-body-md text-body-md text-on-surface-variant [&_h1]:text-primary [&_h2]:text-primary [&_h3]:text-primary [&_strong]:text-primary"
                      dangerouslySetInnerHTML={{
                        __html: product.content || product.description || "",
                      }}
                    />
                  </section>
                )}

                {related.length > 0 && (
                  <section className="mt-14">
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <h2 className="font-headline-md text-headline-md font-semibold text-primary">
                        Birlikte Tercih Edilen Ürünler
                      </h2>
                      <Link
                        className="font-label-md text-label-md text-primary-container hover:underline"
                        href="/urunler"
                      >
                        Tüm Ürünleri İncele →
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {related.map((item) => (
                        <Link
                          className="group flex flex-col overflow-hidden rounded-3xl border border-border-delicate bg-canvas-pure shadow-sm transition-shadow hover:shadow-lg"
                          href={`/urunler/${item.slug || item.id}`}
                          key={item.id}
                        >
                          <div className="relative aspect-square">
                            {item.thumbnail ? (
                              <img
                                alt={item.title}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                                src={item.thumbnail}
                              />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center bg-blush-surface text-primary-container">
                                <GraduationCap className="size-8" />
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 p-4">
                            <p className="font-title-sm text-title-sm font-semibold text-primary">
                              {item.title}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-title-sm text-title-sm font-bold text-primary">
                                {formatPrice(item.effective_price)}
                              </span>
                              <span className="rounded-full bg-blush-surface px-3 py-1 font-label-sm text-label-sm font-semibold text-primary transition-colors group-hover:bg-blush-hover">
                                İncele
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </ServicesPageShell>
  );
}
