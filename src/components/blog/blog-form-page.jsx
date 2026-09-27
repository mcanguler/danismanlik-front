"use client";

import { useState } from "react";
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
import { ContentEditor } from "@/components/ui/content-editor";
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
  useCreateBlogPost,
  useUpdateBlogPost,
} from "@/lib/blog";
import { AdminFormPage } from "@/components/admin/admin-form-page";

const LIST_PATH = "/dashboard/admin/blog";

const blogFormSchema = z.object({
  blog_category_id: z.string().min(1, "Kategori zorunludur"),
  title: z.string().min(1, "Başlık zorunludur"),
  short_description: z.string(),
  content: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
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
  published_at: z.string(),
  is_active: z.boolean(),
});

const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function toFormValues(post) {
  return {
    blog_category_id:
      post?.blog_category_id != null
        ? String(post.blog_category_id)
        : post?.category?.id != null
          ? String(post.category.id)
          : "",
    title: post?.title ?? "",
    short_description: post?.short_description ?? "",
    content: post?.content ?? "",
    seo_title: post?.seo_title ?? "",
    seo_description: post?.seo_description ?? "",
    thumbnail: null,
    published_at: post?.published_at
      ? new Date(post.published_at).toISOString().slice(0, 16)
      : "",
    is_active: post ? Boolean(post.is_active) : true,
  };
}

export function BlogCreatePage() {
  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Blog Yazıları"
      title="Yeni Blog Yazısı"
      description="Blog yazısı bilgilerini girin"
      cardTitle="Blog Yazısı Bilgileri"
    >
      <BlogForm isEdit={false} post={null} />
    </AdminFormPage>
  );
}

export function BlogEditPage({ id, query }) {
  const post = query.data;

  if (query.isPending) {
    return (
      <AdminFormPage
        backHref={LIST_PATH}
        backLabel="Blog Yazıları"
        title="Blog Yazısını Düzenle"
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
        backLabel="Blog Yazıları"
        title="Blog Yazısını Düzenle"
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-destructive">{getErrorMessage(query.error)}</p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Tekrar Dene
          </Button>
        </div>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Blog Yazıları"
      title="Blog Yazısını Düzenle"
      description={post?.title ?? "Blog yazısı bilgileri"}
      cardTitle="Blog Yazısı Bilgileri"
    >
      <BlogForm key={post.id} isEdit post={post} />
    </AdminFormPage>
  );
}

function BlogForm({ isEdit, post }) {
  const router = useRouter();
  const create = useCreateBlogPost();
  const update = useUpdateBlogPost();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(blogFormSchema.shape);

  const categoriesQuery = useAdminBlogCategoriesQuery();
  const categories = categoriesQuery.data ?? [];

  const form = useForm({
    resolver: zodResolver(blogFormSchema),
    defaultValues: toFormValues(post),
  });
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);

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
    const fields = {
      blog_category_id: Number(rest.blog_category_id),
      title: rest.title,
      short_description: rest.short_description ?? "",
      content: rest.content ?? "",
      seo_title: rest.seo_title ?? "",
      seo_description: rest.seo_description ?? "",
      published_at: rest.published_at ? rest.published_at : null,
      is_active: rest.is_active,
    };
    const hasNewImage =
      typeof File !== "undefined" && thumbnail instanceof File;
    const toFormDataFields = () => ({
      ...fields,
      ...(fields.published_at == null ? { published_at: "" } : {}),
    });

    if (isEdit) {
      let payload;
      if (hasNewImage) {
        payload = buildFormData({ _method: "PATCH", ...toFormDataFields() });
        payload.append("thumbnail", thumbnail);
      } else if (thumbnailRemoved) {
        payload = buildFormData({
          _method: "PATCH",
          ...toFormDataFields(),
          thumbnail_remove: 1,
        });
      } else {
        payload = fields;
      }
      update.mutate(
        { id: post.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Blog yazısı güncellendi", type: "success" });
            router.push(LIST_PATH);
          },
          onError: handleError,
        }
      );
      return;
    }

    let payload;
    if (hasNewImage) {
      payload = buildFormData(toFormDataFields());
      payload.append("thumbnail", thumbnail);
    } else {
      payload = fields;
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Blog yazısı oluşturuldu", type: "success" });
        router.push(LIST_PATH);
      },
      onError: handleError,
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="blog_category">Kategori</Label>
        <Controller
          control={form.control}
          name="blog_category_id"
          render={({ field }) => (
            <select
              className={selectClassName}
              disabled={mutation.isPending}
              id="blog_category"
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
            >
              <option disabled value="">
                —
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        />
        {form.formState.errors.blog_category_id && (
          <p className="text-xs text-destructive">
            {form.formState.errors.blog_category_id.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="blog_title">Başlık</Label>
        <Input
          id="blog_title"
          placeholder="Örn. Etkili İletişim Teknikleri"
          type="text"
          aria-invalid={Boolean(form.formState.errors.title)}
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="blog_short_description">Kısa Açıklama</Label>
        <Textarea
          id="blog_short_description"
          placeholder="Listelerde görünen kısa açıklama"
          rows={3}
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
              id="blog_content"
              minHeight="12rem"
              onChange={field.onChange}
              placeholder="Blog içeriğini yazın..."
              value={field.value ?? ""}
            />
          )}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="blog_seo_title">SEO Başlık</Label>
        <Input
          id="blog_seo_title"
          placeholder="Boş bırakılırsa başlık kullanılır"
          type="text"
          {...form.register("seo_title")}
        />
        {form.formState.errors.seo_title && (
          <p className="text-xs text-destructive">
            {form.formState.errors.seo_title.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="blog_seo_description">SEO Açıklama</Label>
        <Textarea
          id="blog_seo_description"
          placeholder="Boş bırakılırsa kısa açıklama kullanılır"
          rows={2}
          {...form.register("seo_description")}
        />
        {form.formState.errors.seo_description && (
          <p className="text-xs text-destructive">
            {form.formState.errors.seo_description.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="blog_thumbnail">Thumbnail</Label>
        <Controller
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <ImageUploadField
              disabled={mutation.isPending}
              error={form.formState.errors.thumbnail?.message}
              existingUrl={isEdit ? (post.thumbnail ?? "") : ""}
              id="blog_thumbnail"
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
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="blog_published_at">Yayın Tarihi</Label>
        <Input
          id="blog_published_at"
          type="datetime-local"
          {...form.register("published_at")}
        />
        <p className="text-xs text-muted-foreground">
          Boş bırakılırsa yazı taslak olarak kalır
        </p>
        {form.formState.errors.published_at && (
          <p className="text-xs text-destructive">
            {form.formState.errors.published_at.message}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="blog_is_active">Aktif</Label>
          <p className="text-xs text-muted-foreground">
            Blog yazısının aktif/pasif durumu
          </p>
        </div>
        <Controller
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <Switch
              checked={field.value}
              id="blog_is_active"
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
