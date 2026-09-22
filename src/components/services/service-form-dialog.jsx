"use client";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useServiceCategoriesQuery } from "@/lib/service-categories";
import { useCreateService, useUpdateService } from "@/lib/services";
import {useState} from "react";

const serviceFormSchema = z.object({
  service_category_id: z.coerce
    .number({ message: "Kategori seçin" })
    .int({ message: "Kategori seçin" })
    .min(1, "Kategori seçin"),
  name: z.string().min(1, "Name zorunludur"),
  description: z.string(),
  short_description: z.string().max(500, "En fazla 500 karakter olabilir"),
  content: z.string(),
  image: z
    .any()
    .refine(
      (value) => value == null || IMAGE_ALLOWED_MIME_TYPES.includes(value.type),
      "Sadece JPG, JPEG, PNG ve WEBP formatları desteklenir"
    )
    .refine(
      (value) => value == null || value.size <= IMAGE_MAX_SIZE_BYTES,
      `Dosya boyutu en fazla ${IMAGE_MAX_SIZE_MB} MB olabilir`
    ),
  seo_title: z.string(),
  seo_description: z.string(),
  is_active: z.boolean(),
  sort_order: z.coerce
    .number({ message: "Geçerli bir sıra numarası girin" })
    .int({ message: "Sıra numarası tam sayı olmalıdır" })
    .min(0, "Sıra numarası 0 veya daha büyük olmalıdır"),
});

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function toFormValues(service) {
  return {
    service_category_id: service?.service_category_id ?? "",
    name: service?.name ?? "",
    description: service?.description ?? "",
    short_description: service?.short_description ?? "",
    content: service?.content ?? "",
    image: null,
    seo_title: service?.seo_title ?? "",
    seo_description: service?.seo_description ?? "",
    is_active: service ? Boolean(service.is_active) : true,
    sort_order: service?.sort_order ?? 0,
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function ServiceFormDialog({ open, service, onOpenChange }) {
  const isEdit = Boolean(service);
  const create = useCreateService();
  const update = useUpdateService();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(serviceFormSchema.shape);

  const categoriesQuery = useServiceCategoriesQuery();
  const categories = categoriesQuery.data ?? [];

  const form = useForm({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: toFormValues(service),
  });
  const [imageRemoved, setImageRemoved] = useState(false);
  const shortDescription = useWatch({ control: form.control, name: "short_description" }) ?? "";

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
    const { image, ...rest } = values;
    const fields = {
      service_category_id: Number(rest.service_category_id),
      name: rest.name,
      description: rest.description ?? "",
      short_description: rest.short_description ?? "",
      content: rest.content ?? "",
      seo_title: rest.seo_title ?? "",
      seo_description: rest.seo_description ?? "",
      is_active: rest.is_active,
      sort_order: rest.sort_order,
    };
    const hasNewImage =
      typeof File !== "undefined" && image instanceof File;

    if (isEdit) {
      let payload;
      if (hasNewImage) {
        payload = buildFormData({ _method: "PUT", ...fields });
        payload.append("image", image);
      } else if (imageRemoved) {
        payload = buildFormData({ _method: "PUT", ...fields, image_remove: 1 });
      } else {
        payload = fields;
      }
      update.mutate(
        { id: service.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Hizmet güncellendi", type: "success" });
            onOpenChange(false);
          },
          onError: handleError,
        }
      );
      return;
    }

    const payload = buildFormData(fields);
    if (hasNewImage) payload.append("image", image);
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Hizmet oluşturuldu", type: "success" });
        onOpenChange(false);
      },
      onError: handleError,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Hizmeti Düzenle" : "Yeni Hizmet"}</DialogTitle>
          <DialogDescription>
            {isEdit ? service.name : "Hizmet bilgilerini girin"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service_category_id">Kategori</Label>
            {categoriesQuery.isPending ? (
              <div className="flex h-8 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Kategoriler yükleniyor...
              </div>
            ) : (
              <select
                id="service_category_id"
                className={selectClassName}
                disabled={categories.length === 0}
                aria-invalid={Boolean(form.formState.errors.service_category_id)}
                {...form.register("service_category_id")}
              >
                <option value="">Kategori seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            {!categoriesQuery.isPending && categories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Önce bir hizmet kategorisi ekleyin
              </p>
            )}
            {form.formState.errors.service_category_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.service_category_id.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Örn. Bireysel Danışmanlık"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          {isEdit && service.slug && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" type="text" value={service.slug} readOnly disabled />
              <p className="text-xs text-muted-foreground">
                Name değişirse otomatik güncellenir
              </p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Hizmet açıklaması"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="short_description">Kısa Açıklama</Label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  shortDescription.length > 500
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {shortDescription.length}/500
              </span>
            </div>
            <Textarea
              id="short_description"
              rows={3}
              maxLength={500}
              placeholder="Kartlarda görünen kısa açıklama"
              aria-invalid={Boolean(form.formState.errors.short_description)}
              {...form.register("short_description")}
            />
            {form.formState.errors.short_description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.short_description.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>İçerik</Label>
            <Controller
              control={form.control}
              name="content"
              render={({ field }) => (
                <ContentEditor
                  disabled={mutation.isPending}
                  error={form.formState.errors.content?.message}
                  id="content"
                  minHeight="12rem"
                  onChange={field.onChange}
                  placeholder="Hizmet içeriğini yazın..."
                  value={field.value ?? ""}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="image">Görsel</Label>
            <Controller
              control={form.control}
              name="image"
              render={({ field }) => (
                <ImageUploadField
                  disabled={mutation.isPending}
                  error={form.formState.errors.image?.message}
                  existingUrl={isEdit ? (service.image ?? "") : ""}
                  id="image"
                  removed={imageRemoved}
                  onClearSelection={() => field.onChange(null)}
                  onRemoveExisting={
                    isEdit ? () => setImageRemoved(true) : undefined
                  }
                  onSelect={(file) => {
                    const fileError = imageFileError(file);
                    if (fileError) {
                      form.setError("image", { message: fileError });
                      return false;
                    }
                    setImageRemoved(false);
                    field.onChange(file);
                    return true;
                  }}
                  onUndoRemoveExisting={
                    isEdit ? () => setImageRemoved(false) : undefined
                  }
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seo_title">SEO Title</Label>
            <Input
              id="seo_title"
              type="text"
              placeholder="SEO başlığı"
              {...form.register("seo_title")}
            />
            {form.formState.errors.seo_title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.seo_title.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seo_description">SEO Description</Label>
            <Textarea
              id="seo_description"
              rows={3}
              placeholder="SEO açıklaması"
              {...form.register("seo_description")}
            />
            {form.formState.errors.seo_description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.seo_description.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="is_active">Aktif</Label>
              <p className="text-xs text-muted-foreground">
                Hizmetin aktif/pasif durumu
              </p>
            </div>
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Switch
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sort_order">Sıra</Label>
            <Input
              id="sort_order"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              aria-invalid={Boolean(form.formState.errors.sort_order)}
              {...form.register("sort_order")}
            />
            {form.formState.errors.sort_order && (
              <p className="text-xs text-destructive">
                {form.formState.errors.sort_order.message}
              </p>
            )}
          </div>
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10"
            >
              İptal
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="h-10">
              {mutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {mutation.isPending
                ? "Kaydediliyor..."
                : isEdit
                  ? "Kaydet"
                  : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}