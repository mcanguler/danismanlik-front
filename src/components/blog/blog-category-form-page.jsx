"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  useAdminBlogCategoriesQuery,
  useCreateBlogCategory,
  useUpdateBlogCategory,
} from "@/lib/blog";
import { AdminFormPage } from "@/components/admin/admin-form-page";

const LIST_PATH = "/dashboard/admin/blog-kategorileri";

const blogCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Kategori adı zorunludur")
    .max(255, "En fazla 255 karakter olabilir"),
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
  seo_title: z.string().max(255, "En fazla 255 karakter olabilir"),
  seo_description: z.string(),
  is_active: z.boolean(),
  sort_order: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d+$/.test(value),
      "Geçerli bir sıra numarası girin"
    ),
});

function toFormValues(category) {
  return {
    name: category?.name ?? "",
    image: null,
    seo_title: category?.seo_title ?? "",
    seo_description: category?.seo_description ?? "",
    is_active: category ? Boolean(category.is_active) : true,
    sort_order:
      category?.sort_order === undefined || category?.sort_order === null
        ? "0"
        : String(category.sort_order),
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function BlogCategoryCreatePage() {
  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Blog Kategorileri"
      title="Yeni Kategori"
      description="Blog kategorisi bilgilerini girin"
      cardTitle="Kategori Bilgileri"
    >
      <BlogCategoryForm isEdit={false} category={null} />
    </AdminFormPage>
  );
}

export function BlogCategoryEditPage({ id }) {
  const query = useAdminBlogCategoriesQuery({});
  const data = query.data;
  const categories = Array.isArray(data) ? data : (data?.items ?? []);
  const category = categories.find((item) => String(item.id) === String(id));

  if (query.isPending) {
    return (
      <AdminFormPage
        backHref={LIST_PATH}
        backLabel="Blog Kategorileri"
        title="Kategoriyi Düzenle"
      >
        <div className="flex justify-center py-10">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AdminFormPage>
    );
  }

  if (query.isError) {
    return (
      <AdminFormPage
        backHref={LIST_PATH}
        backLabel="Blog Kategorileri"
        title="Kategoriyi Düzenle"
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-destructive">
            {getErrorMessage(query.error)}
          </p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Tekrar Dene
          </Button>
        </div>
      </AdminFormPage>
    );
  }

  if (!category) {
    return (
      <AdminFormPage
        backHref={LIST_PATH}
        backLabel="Blog Kategorileri"
        title="Kategoriyi Düzenle"
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">Kayıt bulunamadı.</p>
          <Link
            className="text-sm text-muted-foreground hover:text-foreground"
            href={LIST_PATH}
          >
            Listeye dön
          </Link>
        </div>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Blog Kategorileri"
      title="Kategoriyi Düzenle"
      description={category?.name ?? "Kategori bilgileri"}
      cardTitle="Kategori Bilgileri"
    >
      <BlogCategoryForm key={category.id} isEdit category={category} />
    </AdminFormPage>
  );
}

function BlogCategoryForm({ isEdit, category }) {
  const router = useRouter();
  const create = useCreateBlogCategory();
  const update = useUpdateBlogCategory();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(blogCategorySchema.shape);

  const form = useForm({
    resolver: zodResolver(blogCategorySchema),
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
    const parsedSortOrder = Number(rest.sort_order ?? "");
    const fields = {
      name: rest.name,
      seo_title: rest.seo_title ?? "",
      seo_description: rest.seo_description ?? "",
      is_active: rest.is_active,
      sort_order: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 0,
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
        payload = fields;
      }
      update.mutate(
        { id: category.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Kategori güncellendi", type: "success" });
            router.push(LIST_PATH);
          },
          onError: handleError,
        }
      );
      return;
    }

    let payload;
    if (hasNewImage) {
      payload = buildFormData(fields);
      payload.append("image", image);
    } else {
      payload = fields;
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Kategori oluşturuldu", type: "success" });
        router.push(LIST_PATH);
      },
      onError: handleError,
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Kategori Adı</Label>
        <Input
          id="name"
          type="text"
          placeholder="Örn. Rehberlik"
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
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
          rows={2}
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
            Kategorinin blogda görünürlüğü
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
      <div className="flex items-center justify-end gap-2">
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
      </div>
    </form>
  );
}
