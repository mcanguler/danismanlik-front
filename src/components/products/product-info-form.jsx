"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ContentEditor } from "@/components/ui/content-editor";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_MB,
  buildFormData,
  imageFileError,
} from "@/lib/image-upload";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import {
  PRODUCT_TYPES,
  useCreateProduct,
  useProductCategoriesQuery,
  useUpdateProduct,
} from "@/lib/products";

const productInfoSchema = z
  .object({
    type: z.enum([PRODUCT_TYPES.PHYSICAL, PRODUCT_TYPES.DIGITAL]),
    title: z
      .string()
      .min(1, "Başlık zorunludur")
      .max(255, "En fazla 255 karakter olabilir"),
    description: z.string(),
    content: z.string(),
    thumbnail: z
      .any()
      .refine(
        (value) => value == null || IMAGE_ALLOWED_MIME_TYPES.includes(value.type),
        "Sadece JPG, JPEG, PNG ve WEBP formatları desteklenir"
      )
      .refine(
        (value) => value == null || value.size <= IMAGE_MAX_SIZE_BYTES,
        `Dosya boyutu en fazla ${IMAGE_MAX_SIZE_MB} MB olabilir`
      ),
    price: z.coerce
      .number({ message: "Geçerli bir fiyat girin" })
      .min(0, "Fiyat 0 veya daha büyük olmalıdır"),
    discount_price: z.union([
      z.literal(""),
      z.coerce
        .number({ message: "Geçerli bir fiyat girin" })
        .min(0, "İndirimli fiyat 0 veya daha büyük olmalıdır"),
    ]),
    stock: z.coerce
      .number({ message: "Geçerli bir stok girin" })
      .int({ message: "Stok tam sayı olmalıdır" })
      .min(0, "Stok 0 veya daha büyük olmalıdır"),
    product_category_id: z.union([z.literal(""), z.coerce.number().int().min(1)]),
    is_active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.discount_price === "" || values.discount_price == null) return;
    if (Number(values.discount_price) >= Number(values.price)) {
      ctx.addIssue({
        code: "custom",
        path: ["discount_price"],
        message: "İndirimli fiyat, fiyattan düşük olmalıdır",
      });
    }
  });

function toFormValues(product) {
  return {
    type: product?.type ?? PRODUCT_TYPES.PHYSICAL,
    title: product?.title ?? "",
    description: product?.description ?? "",
    content: product?.content ?? "",
    thumbnail: null,
    price: product?.price ?? "",
    discount_price: product?.discount_price ?? "",
    stock: product?.stock ?? 0,
    product_category_id: product?.product_category_id != null
      ? String(product.product_category_id)
      : "",
    is_active: product ? Boolean(product.is_active) : true,
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

export function ProductInfoForm({ product, onCreated }) {
  const isEdit = Boolean(product);
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(productInfoSchema.shape);

  const form = useForm({
    resolver: zodResolver(productInfoSchema),
    defaultValues: toFormValues(product),
  });
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const type = useWatch({ control: form.control, name: "type" });
  const isDigital = type === PRODUCT_TYPES.DIGITAL;
  const categoriesQuery = useProductCategoriesQuery();
  const categories = categoriesQuery.data ?? [];

  const handleError = (error) => {
    if (error instanceof ApiError) {
      for (const [field, messages] of Object.entries(error.errors ?? {})) {
        if (fieldNames.includes(field)) {
          const message = Array.isArray(messages) ? messages[0] : messages;
          form.setError(field, { message });
        }
      }
      form.setError("root", { message: error.message });
    } else {
      form.setError("root", { message: getErrorMessage(error) });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const { thumbnail, ...rest } = values;
    const categoryId =
      rest.product_category_id === "" ? null : Number(rest.product_category_id);
    const fields = {
      type: rest.type,
      title: rest.title,
      description: rest.description ?? "",
      content: rest.content ?? "",
      price: rest.price,
      discount_price: rest.discount_price ?? "",
      ...(isDigital ? {} : { stock: rest.stock }),
      ...(categoryId != null ? { product_category_id: categoryId } : {}),
      is_active: rest.is_active,
    };
    const hasNewImage =
      typeof File !== "undefined" && thumbnail instanceof File;

    if (isEdit) {
      let payload;
      if (hasNewImage) {
        payload = buildFormData({ _method: "PATCH", ...fields });
        if (categoryId == null) payload.append("product_category_id", "");
        payload.append("thumbnail", thumbnail);
      } else if (thumbnailRemoved) {
        payload = buildFormData({
          _method: "PATCH",
          ...fields,
          ...(categoryId == null ? { product_category_id: "" } : {}),
          thumbnail_remove: 1,
        });
      } else {
        payload = {
          ...fields,
          price: Number(fields.price),
          discount_price:
            fields.discount_price === "" ? null : Number(fields.discount_price),
          product_category_id: categoryId,
          ...(isDigital ? {} : { stock: Number(fields.stock) }),
        };
      }
      update.mutate(
        { id: product.id, payload },
        {
          onSuccess: (updated) => {
            setThumbnailRemoved(false);
            toast.add({ title: "Ürün bilgileri kaydedildi", type: "success" });
            form.reset(toFormValues(updated));
          },
          onError: handleError,
        }
      );
      return;
    }

    const payload = buildFormData(fields);
    if (hasNewImage) payload.append("thumbnail", thumbnail);
    create.mutate(payload, {
      onSuccess: (created) => {
        toast.add({ title: "Ürün oluşturuldu", type: "success" });
        onCreated?.(created);
      },
      onError: handleError,
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product_type">Ürün Tipi</Label>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <select
                className={selectClassName}
                disabled={mutation.isPending}
                id="product_type"
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              >
                <option value={PRODUCT_TYPES.PHYSICAL}>Fiziksel Ürün</option>
                <option value={PRODUCT_TYPES.DIGITAL}>Dijital Ürün</option>
              </select>
            )}
          />
          {isEdit && (
            <p className="text-xs text-muted-foreground">
              Tipi değiştirmek kaydettikten sonra Galeri, Alanlar, Varyasyonlar
              ve Dijital Dosyalar bölümlerini günceller
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product_stock">Stok</Label>
          <Input
            disabled={mutation.isPending || isDigital}
            id="product_stock"
            inputMode="numeric"
            min="0"
            placeholder={isDigital ? "Dijital ürünlerde stok yok" : "Örn. 25"}
            step="1"
            type="number"
            {...form.register("stock")}
          />
          {form.formState.errors.stock && (
            <p className="text-xs text-destructive">
              {form.formState.errors.stock.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product_category">Kategori</Label>
        <Controller
          control={form.control}
          name="product_category_id"
          render={({ field }) => (
            <select
              className={selectClassName}
              disabled={mutation.isPending}
              id="product_category"
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
            >
              <option value="">Kategori seçilmedi (opsiyonel)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        />
        {form.formState.errors.product_category_id && (
          <p className="text-xs text-destructive">
            {form.formState.errors.product_category_id.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Kategoriler{" "}
          <span className="font-mono">Ürün Kategorileri</span> bölümünden
          yönetilir
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product_title">Başlık</Label>
        <Input
          id="product_title"
          placeholder="Örn. Kablosuz Kulaklık"
          type="text"
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      {isEdit && product.slug && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product_slug">Slug</Label>
          <Input
            disabled
            id="product_slug"
            readOnly
            type="text"
            value={product.slug}
          />
          <p className="text-xs text-muted-foreground">
            Başlık değişirse otomatik güncellenir
          </p>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product_description">Kısa Açıklama</Label>
        <Textarea
          id="product_description"
          placeholder="Ürün listelerinde görünen kısa açıklama"
          rows={3}
          {...form.register("description")}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>İçerik / Açıklama</Label>
        <Controller
          control={form.control}
          name="content"
          render={({ field }) => (
            <ContentEditor
              disabled={mutation.isPending}
              id="product_content"
              minHeight="10rem"
              onChange={field.onChange}
              placeholder="Ürün detay sayfası içeriğini yazın..."
              value={field.value ?? ""}
            />
          )}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product_thumbnail">Thumbnail</Label>
        <Controller
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <ImageUploadField
              disabled={mutation.isPending}
              error={form.formState.errors.thumbnail?.message}
              existingUrl={isEdit ? (product.thumbnail ?? "") : ""}
              id="product_thumbnail"
              removed={thumbnailRemoved}
              onClearSelection={() => field.onChange(null)}
              onRemoveExisting={
                isEdit ? () => setThumbnailRemoved(true) : undefined
              }
              onSelect={(file) => {
                const fileError = imageFileError(file);
                if (fileError) {
                  form.setError("thumbnail", { message: fileError });
                  return false;
                }
                setThumbnailRemoved(false);
                field.onChange(file);
                return true;
              }}
              onUndoRemoveExisting={
                isEdit ? () => setThumbnailRemoved(false) : undefined
              }
            />
          )}
        />
        <p className="text-xs text-muted-foreground">
          Galeri görselleri ayrı olarak Galeri bölümünden yönetilir
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product_price">Fiyat (TL)</Label>
          <Input
            id="product_price"
            inputMode="decimal"
            min="0"
            placeholder="Örn. 2500"
            step="0.01"
            type="number"
            {...form.register("price")}
          />
          {form.formState.errors.price && (
            <p className="text-xs text-destructive">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product_discount_price">İndirimli Fiyat (TL)</Label>
          <Input
            id="product_discount_price"
            inputMode="decimal"
            min="0"
            placeholder="Boş bırakılırsa indirim yok"
            step="0.01"
            type="number"
            {...form.register("discount_price")}
          />
          {form.formState.errors.discount_price && (
            <p className="text-xs text-destructive">
              {form.formState.errors.discount_price.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="product_is_active">Aktif</Label>
          <p className="text-xs text-muted-foreground">
            Ürünün mağazada görünürlüğü
          </p>
        </div>
        <Controller
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <Switch
              checked={field.value}
              id="product_is_active"
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>
      {form.formState.errors.root && (
        <p className={cn("text-sm text-destructive")}>
          {form.formState.errors.root.message}
        </p>
      )}
      <div className="flex justify-end">
        <Button className="h-10" disabled={mutation.isPending} type="submit">
          {mutation.isPending && (
            <LoaderCircle className="size-4 animate-spin" />
          )}
          {mutation.isPending ? "Kaydediliyor..." : isEdit ? "Kaydet" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}
