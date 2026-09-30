"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileSignature, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
  CONTRACT_PLACEHOLDERS,
  CONTRACT_TYPES,
  CONTRACT_TYPE_LABELS,
  useAdminContractTemplateQuery,
  useContractTemplatePreviewQuery,
  useCreateContractTemplate,
  useUpdateContractTemplate,
} from "@/lib/contracts";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { AdminFormPage } from "@/components/admin/admin-form-page";

const versionRegex = /^\d+(\.\d+){0,2}$/;

const contractFormSchema = z.object({
  type: z.enum(CONTRACT_TYPES),
  title: z.string().min(1, "Başlık zorunludur").max(255),
  version: z
    .string()
    .min(1, "Versiyon zorunludur")
    .max(32)
    .regex(versionRegex, "Örn. 1, 1.0 veya 1.0.1"),
  content: z.string().min(1, "İçerik zorunludur"),
  is_active: z.boolean(),
});

function toFormValues(template) {
  return {
    type: template?.type ?? "DISTANCE_SALES",
    title: template?.title ?? "",
    version: template?.version ?? "",
    content: template?.content ?? "",
    is_active: template ? Boolean(template.is_active) : true,
  };
}

export function ContractTemplateCreatePage() {
  return (
    <AdminFormPage
      backHref="/dashboard/admin/sozlesmeler"
      backLabel="Sözleşmeler"
      title="Yeni Sözleşme"
      description="Sözleşme şablonu oluşturun"
      cardTitle="Sözleşme Şablonu"
    >
      <ContractTemplateForm isEdit={false} templateId={null} />
    </AdminFormPage>
  );
}

export function ContractTemplateEditPage({ id, query }) {
  if (query.isPending) {
    return (
      <AdminFormPage
        backHref="/dashboard/admin/sozlesmeler"
        backLabel="Sözleşmeler"
        title="Sözleşmeyi Düzenle"
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
        backHref="/dashboard/admin/sozlesmeler"
        backLabel="Sözleşmeler"
        title="Sözleşmeyi Düzenle"
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-destructive">
            {getQueryErrorMessage(query.error)}
          </p>
          <Button onClick={() => query.refetch()} size="sm" variant="outline">
            Tekrar Dene
          </Button>
        </div>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref="/dashboard/admin/sozlesmeler"
      backLabel="Sözleşmeler"
      title="Sözleşmeyi Düzenle"
      description={query.data?.title || "Sözleşme şablonu"}
      cardTitle="Sözleşme Şablonu"
    >
      <ContractTemplateForm
        key={query.data.id}
        isEdit
        templateId={query.data.id}
      />
    </AdminFormPage>
  );
}

function ContractTemplateForm({ isEdit, templateId }) {
  const router = useRouter();
  const create = useCreateContractTemplate();
  const update = useUpdateContractTemplate();
  const mutation = isEdit ? update : create;
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewQuery = useContractTemplatePreviewQuery(templateId, {
    enabled: previewOpen && Boolean(templateId),
  });

  const form = useForm({
    resolver: zodResolver(contractFormSchema),
    defaultValues: toFormValues(null),
  });

  const handleError = (error) => {
    const fieldErrors = error?.errors ?? {};
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (["type", "title", "version", "content", "is_active"].includes(field)) {
        const message = Array.isArray(messages) ? messages[0] : messages;
        form.setError(field, { message });
      }
    }
    form.setError("root", {
      message:
        error?.message ??
        getQueryErrorMessage(error) ??
        "Beklenmeyen bir hata oluştu",
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    if (isEdit) {
      update.mutate(
        { id: templateId, payload: values },
        {
          onSuccess: () => {
            toast.add({ title: "Sözleşme güncellendi", type: "success" });
            router.push("/dashboard/admin/sozlesmeler");
          },
          onError: handleError,
        }
      );
      return;
    }
    create.mutate(values, {
      onSuccess: () => {
        toast.add({ title: "Sözleşme oluşturuldu", type: "success" });
        router.push("/dashboard/admin/sozlesmeler");
      },
      onError: handleError,
    });
  });

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contract_type">Tip</Label>
        <select
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          disabled={mutation.isPending}
          id="contract_type"
          {...form.register("type")}
        >
          {CONTRACT_TYPES.map((type) => (
            <option key={type} value={type}>
              {CONTRACT_TYPE_LABELS[type] ?? type}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Bu tip için aynı anda yalnızca bir aktif şablon olabilir
        </p>
        {form.formState.errors.type && (
          <p className="text-xs text-destructive">
            {form.formState.errors.type.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contract_title">Başlık</Label>
        <Input
          aria-invalid={Boolean(form.formState.errors.title)}
          id="contract_title"
          placeholder="Örn. Mesafeli Satış Sözleşmesi"
          type="text"
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contract_version">Versiyon</Label>
        <Input
          aria-invalid={Boolean(form.formState.errors.version)}
          id="contract_version"
          placeholder="Örn. 1.0"
          type="text"
          {...form.register("version")}
        />
        {form.formState.errors.version && (
          <p className="text-xs text-destructive">
            {form.formState.errors.version.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contract_content">İçerik</Label>
        <Textarea
          aria-invalid={Boolean(form.formState.errors.content)}
          className="min-h-64 font-mono text-xs"
          id="contract_content"
          placeholder="Sözleşme metnini yazın..."
          rows={12}
          {...form.register("content")}
        />
        <p className="text-xs text-muted-foreground">
          Desteklenen alanlar:{" "}
          {CONTRACT_PLACEHOLDERS.map((name) => `{{${name}}}`).join(", ")}
        </p>
        {form.formState.errors.content && (
          <p className="text-xs text-destructive">
            {form.formState.errors.content.message}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="contract_is_active">Aktif</Label>
          <p className="text-xs text-muted-foreground">
            Aktifken checkout&apos;ta onay zorunluluğu doğurur
          </p>
        </div>
        <Controller
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              id="contract_is_active"
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Örnek veriyle önizleme kayıttan sonra kullanılabilir.
      </p>
      {form.formState.errors.root && (
        <p className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        {isEdit && (
          <Button
            disabled={mutation.isPending}
            onClick={() => setPreviewOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <FileSignature className="size-4" />
            Önizle
          </Button>
        )}
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

      <Dialog onOpenChange={setPreviewOpen} open={previewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="pr-6 font-title-lg text-title-lg font-semibold text-primary">
            Önizleme
            {previewQuery.data?.version
              ? ` (v${previewQuery.data.version})`
              : ""}
          </DialogTitle>
          {previewQuery.isPending ? (
            <div className="flex justify-center py-10">
              <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          {previewQuery.isError ? (
            <p className="text-sm text-destructive">
              {getQueryErrorMessage(previewQuery.error)}
            </p>
          ) : null}
          {previewQuery.data?.content ? (
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                {previewQuery.data.content}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </form>
  );
}
