"use client";

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
import { useCreatePage, useUpdatePage } from "@/lib/pages";
import { AdminFormPage } from "@/components/admin/admin-form-page";

const pageFormSchema = z.object({
  title: z
    .string()
    .min(1, "Başlık zorunludur")
    .max(255, "En fazla 255 karakter olabilir"),
  content: z.string(),
  seo_title: z.string().max(255, "En fazla 255 karakter olabilir"),
  seo_description: z.string(),
  is_active: z.boolean(),
});

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function PageCreatePage() {
  return (
    <AdminFormPage
      backHref="/dashboard/admin/sayfalar"
      backLabel="Sayfalar"
      title="Yeni Sayfa"
      description="Public sayfa içeriği oluşturun; slug başlıktan otomatik üretilir"
      cardTitle="Sayfa Bilgileri"
    >
      <PageForm isEdit={false} page={null} />
    </AdminFormPage>
  );
}

export function PageEditPage({ id, query }) {
  const page = query.data;

  if (query.isPending) {
    return (
      <AdminFormPage
        backHref="/dashboard/admin/sayfalar"
        backLabel="Sayfalar"
        title="Sayfayı Düzenle"
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
        backHref="/dashboard/admin/sayfalar"
        backLabel="Sayfalar"
        title="Sayfayı Düzenle"
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
      backHref="/dashboard/admin/sayfalar"
      backLabel="Sayfalar"
      title="Sayfayı Düzenle"
      description={
        page.slug ? `Public adres: /${page.slug}` : "Sayfa bilgilerini güncelleyin"
      }
      cardTitle="Sayfa Bilgileri"
    >
      <PageForm key={page.id} isEdit page={page} />
    </AdminFormPage>
  );
}

function PageForm({ isEdit, page }) {
  const router = useRouter();
  const create = useCreatePage();
  const update = useUpdatePage();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(pageFormSchema.shape);

  const form = useForm({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: page?.title ?? "",
      content: page?.content ?? "",
      seo_title: page?.seo_title ?? "",
      seo_description: page?.seo_description ?? "",
      is_active: page ? Boolean(page.is_active) : true,
    },
  });

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
    const payload = {
      title: values.title,
      content: values.content ?? "",
      seo_title: values.seo_title ?? "",
      seo_description: values.seo_description ?? "",
      is_active: values.is_active,
    };

    if (isEdit) {
      update.mutate(
        { id: page.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Sayfa güncellendi", type: "success" });
            router.push("/dashboard/admin/sayfalar");
          },
          onError: handleError,
        }
      );
      return;
    }

    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Sayfa oluşturuldu", type: "success" });
        router.push("/dashboard/admin/sayfalar");
      },
      onError: handleError,
    });
  });

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="page_title">Başlık</Label>
        <Input
          id="page_title"
          placeholder="Örn. KVKK Aydınlatma Metni"
          type="text"
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      {isEdit && page.slug && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="page_slug">Slug</Label>
          <Input
            disabled
            id="page_slug"
            readOnly
            type="text"
            value={page.slug}
          />
          <p className="text-xs text-muted-foreground">
            Başlık değişirse otomatik güncellenir
          </p>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label>Content</Label>
        <Controller
          control={form.control}
          name="content"
          render={({ field }) => (
            <ContentEditor
              disabled={mutation.isPending}
              error={form.formState.errors.content?.message}
              id="page_content"
              minHeight="12rem"
              onChange={field.onChange}
              placeholder="Sayfa içeriğini yazın..."
              value={field.value ?? ""}
            />
          )}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="page_seo_title">SEO Title</Label>
        <Input
          id="page_seo_title"
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
        <Label htmlFor="page_seo_description">SEO Description</Label>
        <Textarea
          id="page_seo_description"
          placeholder="Boş bırakılırsa content özeti kullanılır"
          rows={3}
          {...form.register("seo_description")}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="page_is_active">Aktif</Label>
          <p className="text-xs text-muted-foreground">
            Aktif sayfalar public tarafta yayınlanır
          </p>
        </div>
        <Controller
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <Switch
              checked={field.value}
              id="page_is_active"
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
        <Button className="h-10" disabled={mutation.isPending} type="submit">
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
