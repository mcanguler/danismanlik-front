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
import { ContentEditor } from "@/components/ui/content-editor";
import {
  useCreateServiceCategory,
  useUpdateServiceCategory,
} from "@/lib/service-categories";

const serviceCategorySchema = z.object({
  name: z.string().min(1, "Name zorunludur"),
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

function toFormValues(category) {
  return {
    name: category?.name ?? "",
    short_description: category?.short_description ?? "",
    content: category?.content ?? "",
    image: null,
    seo_title: category?.seo_title ?? "",
    seo_description: category?.seo_description ?? "",
    is_active: category ? Boolean(category.is_active) : true,
    sort_order: category?.sort_order ?? 0,
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function ServiceCategoryFormDialog({ open, category, onOpenChange }) {
  const isEdit = Boolean(category);
  const create = useCreateServiceCategory();
  const update = useUpdateServiceCategory();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(serviceCategorySchema.shape);

  const form = useForm({
    resolver: zodResolver(serviceCategorySchema),
    defaultValues: toFormValues(category),
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
      name: rest.name,
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
        { id: category.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Kategori güncellendi", type: "success" });
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
        toast.add({ title: "Kategori oluşturuldu", type: "success" });
        onOpenChange(false);
      },
      onError: handleError,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Kategoriyi Düzenle" : "Yeni Kategori"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? category.name : "Hizmet kategorisi bilgilerini girin"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Örn. Psikolojik Danışmanlık"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          {isEdit && category.slug && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" type="text" value={category.slug} readOnly disabled />
              <p className="text-xs text-muted-foreground">
                Name değişirse otomatik güncellenir
              </p>
            </div>
          )}
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
                  placeholder="Kategori içeriğini yazın..."
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
                  existingUrl={isEdit ? (category.image ?? "") : ""}
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
                Kategorinin aktif/pasif durumu
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