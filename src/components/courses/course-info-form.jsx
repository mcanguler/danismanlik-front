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
import { useCreateCourse, useUpdateCourse } from "@/lib/courses";

const courseFormSchema = z
  .object({
    title: z.string().min(1, "Başlık zorunludur").max(255, "En fazla 255 karakter olabilir"),
    short_description: z.string().max(500, "En fazla 500 karakter olabilir"),
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
    price: z.coerce
      .number({ message: "Geçerli bir fiyat girin" })
      .min(0, "Fiyat 0 veya daha büyük olmalıdır"),
    discount_price: z.union([
      z.literal(""),
      z.coerce
        .number({ message: "Geçerli bir fiyat girin" })
        .min(0, "İndirimli fiyat 0 veya daha büyük olmalıdır"),
    ]),
    seo_title: z.string().max(255, "En fazla 255 karakter olabilir"),
    seo_description: z.string(),
    is_active: z.boolean(),
    sort_order: z.coerce
      .number({ message: "Geçerli bir sıra numarası girin" })
      .int({ message: "Sıra numarası tam sayı olmalıdır" })
      .min(0, "Sıra numarası 0 veya daha büyük olmalıdır"),
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

function toFormValues(course) {
  return {
    title: course?.title ?? "",
    short_description: course?.short_description ?? "",
    description: course?.description ?? "",
    image: null,
    price: course?.price ?? "",
    discount_price: course?.discount_price ?? "",
    seo_title: course?.seo_title ?? "",
    seo_description: course?.seo_description ?? "",
    is_active: course ? Boolean(course.is_active) : true,
    sort_order: course?.sort_order ?? 0,
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function CourseInfoForm({ course, onCreated, compact = false }) {
  const isEdit = Boolean(course);
  const create = useCreateCourse();
  const update = useUpdateCourse();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(courseFormSchema.shape);

  const form = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: toFormValues(course),
  });
  const [imageRemoved, setImageRemoved] = useState(false);
  const shortDescription =
    useWatch({ control: form.control, name: "short_description" }) ?? "";

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
      title: rest.title,
      short_description: rest.short_description ?? "",
      description: rest.description ?? "",
      price: rest.price,
      discount_price: rest.discount_price ?? "",
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
        payload = buildFormData({ _method: "PATCH", ...fields });
        payload.append("image", image);
      } else if (imageRemoved) {
        payload = buildFormData({
          _method: "PATCH",
          ...fields,
          image_remove: 1,
        });
      } else {
        payload = {
          ...fields,
          price: Number(fields.price),
          discount_price:
            fields.discount_price === "" ? null : Number(fields.discount_price),
        };
      }
      update.mutate(
        { id: course.id, payload },
        {
          onSuccess: (updated) => {
            setImageRemoved(false);
            toast.add({ title: "Kurs bilgileri kaydedildi", type: "success" });
            form.reset(toFormValues(updated));
          },
          onError: handleError,
        }
      );
      return;
    }

    const payload = buildFormData(fields);
    if (hasNewImage) payload.append("image", image);
    create.mutate(payload, {
      onSuccess: (created) => {
        toast.add({ title: "Kurs oluşturuldu", type: "success" });
        onCreated?.(created);
      },
      onError: handleError,
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Başlık</Label>
        <Input
          id="title"
          type="text"
          placeholder="Örn. Sıfırdan İleri Seviye Danışmanlık Eğitimi"
          aria-invalid={Boolean(form.formState.errors.title)}
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      {isEdit && course.slug && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" type="text" value={course.slug} readOnly disabled />
          <p className="text-xs text-muted-foreground">
            Başlık değişirse otomatik güncellenir
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
        <Label>Açıklama / İçerik</Label>
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <ContentEditor
              disabled={mutation.isPending}
              error={form.formState.errors.description?.message}
              id="description"
              minHeight={compact ? "8rem" : "12rem"}
              onChange={field.onChange}
              placeholder="Kurs içeriğini yazın..."
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
              existingUrl={isEdit ? (course.image ?? "") : ""}
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Fiyat (TL)</Label>
          <Input
            id="price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Örn. 1500"
            aria-invalid={Boolean(form.formState.errors.price)}
            {...form.register("price")}
          />
          {form.formState.errors.price && (
            <p className="text-xs text-destructive">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="discount_price">İndirimli Fiyat (TL)</Label>
          <Input
            id="discount_price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Boş bırakılırsa indirim yok"
            aria-invalid={Boolean(form.formState.errors.discount_price)}
            {...form.register("discount_price")}
          />
          {form.formState.errors.discount_price && (
            <p className="text-xs text-destructive">
              {form.formState.errors.discount_price.message}
            </p>
          )}
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
            Kursun satışta görünürlüğü
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
      {form.formState.errors.root && (
        <p className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending} className="h-10">
          {mutation.isPending && (
            <LoaderCircle className="size-4 animate-spin" />
          )}
          {mutation.isPending ? "Kaydediliyor..." : isEdit ? "Kaydet" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}
