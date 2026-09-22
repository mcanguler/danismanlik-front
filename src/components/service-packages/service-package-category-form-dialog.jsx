"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import {
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_MB,
  buildFormData,
  imageFileError,
} from "@/lib/image-upload";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import {
  useCreateServicePackageCategory,
  useUpdateServicePackageCategory,
} from "@/lib/service-packages";
import { slugify } from "@/lib/slugify";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name zorunludur"),
  slug: z
    .string()
    .min(1, "Slug zorunludur")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Geçerli bir slug girin"),
  description: z.string(),
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
  is_active: z.boolean(),
  sort_order: z.coerce
    .number({ message: "Geçerli bir sıra numarası girin" })
    .int({ message: "Sıra numarası tam sayı olmalıdır" })
    .min(0, "Sıra numarası 0 veya daha büyük olmalıdır"),
});

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function toFormValues(category) {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    image: null,
    is_active: category ? Boolean(category.is_active) : true,
    sort_order: category?.sort_order ?? 0,
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function ServicePackageCategoryFormDialog({
  open,
  category,
  onOpenChange,
}) {
  const isEdit = Boolean(category);
  const create = useCreateServicePackageCategory();
  const update = useUpdateServicePackageCategory();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(categoryFormSchema.shape);

  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: toFormValues(category),
  });
  const [imageRemoved, setImageRemoved] = useState(false);

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
      slug: rest.slug,
      description: rest.description ?? "",
      is_active: rest.is_active,
      sort_order: Number(rest.sort_order),
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
        payload = {
          ...fields,
          description: rest.description ? rest.description : null,
        };
      }
      update.mutate(
        { id: category.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Paket kategorisi güncellendi", type: "success" });
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
        toast.add({ title: "Paket kategorisi oluşturuldu", type: "success" });
        onOpenChange(false);
      },
      onError: handleError,
    });
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Paket Kategorisini Düzenle" : "Yeni Paket Kategorisi"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? category.name : "Paket kategorisi bilgilerini girin"}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-cat-name">Name</Label>
            <Input
              id="pkg-cat-name"
              type="text"
              placeholder="Örn. Bireysel Seans Paketleri"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name", {
                onBlur: (event) => {
                  if (!isEdit) {
                    form.setValue("slug", slugify(event.target.value));
                  }
                },
              })}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-cat-slug">Slug</Label>
            <Input
              id="pkg-cat-slug"
              type="text"
              placeholder="bireysel-seans-paketleri"
              aria-invalid={Boolean(form.formState.errors.slug)}
              {...form.register("slug")}
            />
            {form.formState.errors.slug && (
              <p className="text-xs text-destructive">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-cat-description">Açıklama</Label>
            <Textarea
              id="pkg-cat-description"
              rows={3}
              placeholder="Kategori açıklaması"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-cat-image">Görsel</Label>
            <Controller
              control={form.control}
              name="image"
              render={({ field }) => (
                <ImageUploadField
                  disabled={mutation.isPending}
                  error={form.formState.errors.image?.message}
                  existingUrl={isEdit ? (category.image ?? "") : ""}
                  id="pkg-cat-image"
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
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="pkg-cat-active">Aktif</Label>
              <p className="text-xs text-muted-foreground">
                Kategorinin aktif/pasif durumu
              </p>
            </div>
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Switch
                  id="pkg-cat-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-cat-sort">Sıra</Label>
            <Input
              id="pkg-cat-sort"
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
              className="h-10"
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              İptal
            </Button>
            <Button className="h-10" disabled={mutation.isPending} type="submit">
              {mutation.isPending && <LoaderCircle className="size-4 animate-spin" />}
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

export { selectClassName };
