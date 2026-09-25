"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  GraduationCap,
  Layers,
  LoaderCircle,
  Package,
  Plus,
  ReceiptText,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, useAdminCreateOrder } from "@/lib/orders";
import {
  PRODUCT_FIELD_TYPES,
  PRODUCT_TYPES,
  usePublicProductQuery,
  usePublicProductsQuery,
} from "@/lib/products";
import { usePublicCoursesQuery } from "@/lib/courses";
import { useCustomersQuery } from "@/lib/customers";
import { usePublicServicePackagesQuery } from "@/lib/service-packages";

const ITEM_TYPES = {
  PRODUCT: "PRODUCT",
  COURSE: "COURSE",
  SERVICE_PACKAGE: "SERVICE_PACKAGE",
};

const ITEM_TYPE_LABELS = {
  [ITEM_TYPES.PRODUCT]: "Ürün",
  [ITEM_TYPES.COURSE]: "Kurs",
  [ITEM_TYPES.SERVICE_PACKAGE]: "Hizmet Paketi",
};

const ITEM_TYPE_ICONS = {
  [ITEM_TYPES.PRODUCT]: Package,
  [ITEM_TYPES.COURSE]: GraduationCap,
  [ITEM_TYPES.SERVICE_PACKAGE]: Layers,
};

function getErrorMessage(error) {
  if (error instanceof ApiError) {
    const itemsMessage = error.errors?.items?.[0];
    return itemsMessage ?? error.message;
  }
  return "Beklenmeyen bir hata oluştu";
}

const selectClassName =
  "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function FieldInput({ field, value, onChange }) {
  if (field.type === PRODUCT_FIELD_TYPES.INPUT) {
    return (
      <Input
        id={`admin_field_${field.key}`}
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
        className={selectClassName}
        id={`admin_field_${field.key}`}
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
            onClick={() =>
              onChange(field, value === String(option.id) ? "" : String(option.id))
            }
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

function ProductItemFields({ item, onChange }) {
  const productsQuery = usePublicProductsQuery();
  const detailQuery = usePublicProductQuery(item.product_id || null, {
    enabled: Boolean(item.product_id),
  });
  const product = detailQuery.data;
  const products = productsQuery.data ?? [];

  const variations = product?.variations ?? [];
  const hasVariations = variations.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="font-label-sm text-label-sm font-semibold text-muted-foreground">
          Ürün
        </Label>
        {productsQuery.isPending ? (
          <div className="flex h-10 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Ürünler yükleniyor...
          </div>
        ) : (
          <select
            className={selectClassName}
            onChange={(event) =>
              onChange(item.id, { product_id: event.target.value })
            }
            value={item.product_id}
          >
            <option value="">Ürün seçin</option>
            {products.map((productOption) => (
              <option key={productOption.id} value={productOption.id}>
                {productOption.title} ·{" "}
                {formatPrice(productOption.effective_price)}
              </option>
            ))}
          </select>
        )}
      </div>

      {product && hasVariations && (
        <div className="flex flex-col gap-1.5">
          <Label className="font-label-sm text-label-sm font-semibold text-muted-foreground">
            Varyasyon
          </Label>
          <select
            className={selectClassName}
            onChange={(event) =>
              onChange(item.id, { variation_id: event.target.value })
            }
            value={item.variation_id}
          >
            {variations.map((variation) => (
              <option key={variation.id} value={variation.id}>
                {(variation.options ?? [])
                  .map((option) => option.label)
                  .join(" / ")}{" "}
                · {formatPrice(variation.effective_price)}
              </option>
            ))}
          </select>
        </div>
      )}
      {product && !hasVariations && product.type === PRODUCT_TYPES.PHYSICAL && (
        <p className="text-xs text-muted-foreground">
          Bu ürünün varyasyonu yok
        </p>
      )}

      {product && (product.fields ?? []).length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Custom Fields
          </p>
          {(product.fields ?? []).map((field) => (
            <div className="flex flex-col gap-1.5" key={field.id}>
              <Label htmlFor={`admin_field_${item.id}_${field.key}`}>
                {field.name}
                {field.is_required && <span className="text-destructive"> *</span>}
              </Label>
              <FieldInput
                field={field}
                onChange={(changedField, value) =>
                  onChange(item.id, {
                    selected_options: {
                      ...item.selected_options,
                      [changedField.key]: value,
                    },
                  })
                }
                value={item.selected_options[field.key]}
              />
            </div>
          ))}
        </div>
      )}

      {product && (
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 px-3 py-2">
          <span className="font-label-sm text-label-sm text-muted-foreground">
            Birim Fiyat (backend)
          </span>
          <span className="font-title-sm text-title-sm font-semibold text-primary">
            {formatPrice(
              hasVariations
                ? variations.find(
                    (variation) => String(variation.id) === String(item.variation_id)
                  )?.effective_price ?? product.effective_price
                : product.effective_price
            )}
          </span>
        </div>
      )}
    </div>
  );
}

function OrderItemRow({ item, onChange, onRemove, removable }) {
  const coursesQuery = usePublicCoursesQuery();
  const packagesQuery = usePublicServicePackagesQuery();
  const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const packages = useMemo(() => packagesQuery.data ?? [], [packagesQuery.data]);
  const Icon = ITEM_TYPE_ICONS[item.item_type] ?? Package;

  const unitPrice = useMemo(() => {
    if (item.item_type === ITEM_TYPES.COURSE) {
      const course = courses.find(
        (courseItem) => String(courseItem.id) === String(item.course_id)
      );
      return course?.effective_price ?? null;
    }
    if (item.item_type === ITEM_TYPES.SERVICE_PACKAGE) {
      const pack = packages.find(
        (packageItem) => String(packageItem.id) === String(item.package_id)
      );
      return pack?.price ?? null;
    }
    return null;
  }, [item, courses, packages]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-blush-surface text-primary-container">
          <Icon className="size-4" />
        </span>
        <select
          aria-label="Kalem tipi"
          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          onChange={(event) =>
            onChange(item.id, {
              item_type: event.target.value,
              product_id: "",
              course_id: "",
              package_id: "",
              variation_id: "",
              selected_options: {},
            })
          }
          value={item.item_type}
        >
          {Object.entries(ITEM_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="flex-1" />
        {removable && (
          <Button
            aria-label="Kalemi kaldır"
            onClick={() => onRemove(item.id)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>

      {item.item_type === ITEM_TYPES.PRODUCT && (
        <ProductItemFields item={item} onChange={onChange} />
      )}

      {item.item_type === ITEM_TYPES.COURSE && (
        <div className="flex flex-col gap-1.5">
          <Label className="font-label-sm text-label-sm font-semibold text-muted-foreground">
            Kurs
          </Label>
          {coursesQuery.isPending ? (
            <div className="flex h-10 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Kurslar yükleniyor...
            </div>
          ) : (
            <select
              className={selectClassName}
              onChange={(event) =>
                onChange(item.id, { course_id: event.target.value })
              }
              value={item.course_id}
            >
              <option value="">Kurs seçin</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} · {formatPrice(course.effective_price)}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {item.item_type === ITEM_TYPES.SERVICE_PACKAGE && (
        <div className="flex flex-col gap-1.5">
          <Label className="font-label-sm text-label-sm font-semibold text-muted-foreground">
            Hizmet Paketi
          </Label>
          {packagesQuery.isPending ? (
            <div className="flex h-10 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Paketler yükleniyor...
            </div>
          ) : (
            <select
              className={selectClassName}
              onChange={(event) =>
                onChange(item.id, { package_id: event.target.value })
              }
              value={item.package_id}
            >
              <option value="">Paket seçin</option>
            {packages.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.title} · {formatPrice(pack.price)}
              </option>
            ))}
            </select>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label className="font-label-sm text-label-sm text-muted-foreground" htmlFor={`qty_${item.id}`}>
            Adet
          </Label>
          <Input
            className="h-9 w-24"
            id={`qty_${item.id}`}
            inputMode="numeric"
            max={100}
            min={1}
            onChange={(event) => {
              const value = Number(event.target.value);
              onChange(item.id, {
                quantity: Number.isInteger(value) && value > 0 ? value : 1,
              });
            }}
            step="1"
            type="number"
            value={item.quantity}
          />
        </div>
        {unitPrice != null && (
          <span className="font-label-sm text-label-sm text-muted-foreground">
            Birim: {formatPrice(unitPrice)} · Satır:{" "}
            {formatPrice(Number(unitPrice) * item.quantity)}
          </span>
        )}
      </div>
    </div>
  );
}

let itemIdCounter = 0;

function createItem() {
  itemIdCounter += 1;
  return {
    id: `item-${itemIdCounter}`,
    item_type: ITEM_TYPES.PRODUCT,
    product_id: "",
    course_id: "",
    package_id: "",
    variation_id: "",
    quantity: 1,
    selected_options: {},
  };
}

export function AdminOrderCreate() {
  const router = useRouter();
  const createOrder = useAdminCreateOrder();

  const customersQuery = useCustomersQuery();
  const customers = customersQuery.data ?? [];

  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState(ORDER_STATUSES.PENDING);
  const [items, setItems] = useState(() => [createItem()]);
  const [error, setError] = useState("");

  const updateItem = (id, changes) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  };

  const addItem = () => setItems((current) => [...current, createItem()]);

  const removeItem = (id) =>
    setItems((current) =>
      current.length > 1 ? current.filter((item) => item.id !== id) : current
    );

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!customerId) {
      setError("Müşteri seçin");
      return;
    }

    for (const item of items) {
      if (item.item_type === ITEM_TYPES.PRODUCT && !item.product_id) {
        setError("Her ürün kalemi için ürün seçin");
        return;
      }
      if (item.item_type === ITEM_TYPES.COURSE && !item.course_id) {
        setError("Her kurs kalemi için kurs seçin");
        return;
      }
      if (item.item_type === ITEM_TYPES.SERVICE_PACKAGE && !item.package_id) {
        setError("Her hizmet paketi kalemi için paket seçin");
        return;
      }
    }

    const payload = {
      user_id: Number(customerId),
      status,
      items: items.map((item) => {
        if (item.item_type === ITEM_TYPES.PRODUCT) {
          const selectedOptions = {};
          for (const [key, value] of Object.entries(item.selected_options)) {
            if (value == null) continue;
            if (Array.isArray(value)) {
              if (value.length > 0) {
                selectedOptions[key] = value.map((entry) => Number(entry));
              }
              continue;
            }
            if (String(value).trim() !== "") {
              selectedOptions[key] = String(value).trim();
            }
          }
          return {
            item_type: ITEM_TYPES.PRODUCT,
            item_id: Number(item.product_id),
            variation_id: item.variation_id ? Number(item.variation_id) : null,
            quantity: item.quantity,
            ...(Object.keys(selectedOptions).length > 0
              ? { selected_options: selectedOptions }
              : {}),
          };
        }
        if (item.item_type === ITEM_TYPES.COURSE) {
          return {
            item_type: ITEM_TYPES.COURSE,
            item_id: Number(item.course_id),
            quantity: item.quantity,
          };
        }
        return {
          item_type: ITEM_TYPES.SERVICE_PACKAGE,
          item_id: Number(item.package_id),
          quantity: item.quantity,
        };
      }),
    };

    createOrder.mutate(payload, {
      onSuccess: (order) => {
        toast.add({ title: "Sipariş oluşturuldu", type: "success" });
        router.push(`/dashboard/admin/siparisler/${order.id}`);
      },
      onError: (mutationError) => {
        setError(getErrorMessage(mutationError));
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/dashboard/admin/siparisler"
        >
          ← Siparişler
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">
          Yeni Sipariş
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Müşteri adına sipariş oluşturun; fiyatlar backend tarafından
          hesaplanır
        </p>
      </div>

      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4 text-muted-foreground" />
              Müşteri
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customersQuery.isPending ? (
              <div className="flex h-10 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Müşteriler yükleniyor...
              </div>
            ) : (
              <select
                aria-label="Müşteri seç"
                className={selectClassName}
                onChange={(event) => setCustomerId(event.target.value)}
                value={customerId}
              >
                <option value="">Müşteri seçin</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sipariş Kalemleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <OrderItemRow
                item={item}
                key={item.id}
                onChange={updateItem}
                onRemove={removeItem}
                removable={items.length > 1}
              />
            ))}
            <Button
              className="h-9 self-start"
              onClick={addItem}
              type="button"
              variant="outline"
            >
              <Plus className="size-4" />
              Kalem Ekle
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Durum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              aria-label="Sipariş durumu"
              className={selectClassName}
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value={ORDER_STATUSES.PENDING}>
                Ödeme Bekleniyor (PENDING)
              </option>
              <option value={ORDER_STATUSES.PAID}>
                Ödendi (PAID) — teslimat hemen çalışır
              </option>
            </select>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <ReceiptText className="mt-0.5 size-3.5 shrink-0" />
              PAID seçilirse backend siparişi hemen onaylar ve fulfillment
              işlemlerini (kurs erişimi, hizmet paketi, ürün stok) çalıştırır.
            </p>
          </CardContent>
        </Card>

        {error && (
          <p className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            className="h-10"
            disabled={
              customersQuery.isPending ||
              createOrder.isPending ||
              !customerId
            }
            type="submit"
          >
            {createOrder.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            {createOrder.isPending ? "Oluşturuluyor..." : "Sipariş Oluştur"}
          </Button>
        </div>
      </form>
    </div>
  );
}
