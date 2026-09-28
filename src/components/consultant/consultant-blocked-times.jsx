"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CircleAlert,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useMyConsultant } from "@/lib/consultant-scope";
import {
  useBlockedTimesQuery,
  useCreateBlockedTime,
  useDeleteBlockedTime,
  useUpdateBlockedTime,
} from "@/lib/blocked-times";
import { AdminFormPage } from "@/components/admin/admin-form-page";

const LIST_PATH = "/dashboard/consultant/kapali-zamanlar";

const dateTimeLocalRegex = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;

const blockedTimeSchema = z
  .object({
    start_at: z
      .string()
      .min(1, "Başlangıç tarihi zorunludur")
      .regex(dateTimeLocalRegex, "Geçerli bir başlangıç tarihi girin"),
    end_at: z
      .string()
      .min(1, "Bitiş tarihi zorunludur")
      .regex(dateTimeLocalRegex, "Geçerli bir bitiş tarihi girin"),
    reason: z.string().max(255, "Sebep en fazla 255 karakter olabilir"),
  })
  .refine((data) => data.end_at > data.start_at, {
    message: "Bitiş tarihi başlangıçtan sonra olmalıdır",
    path: ["end_at"],
  });

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function NoConsultantNotice() {
  return (
    <div className="w-full flex-1 px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Kapalı Zamanlar</h1>
      <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
        <CircleAlert className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">Danışman profiliniz bulunamadı</p>
        <p className="text-sm text-muted-foreground">
          Kapalı zamanlarınızı yönetebilmeniz için hesabınızın bir danışman
          profiliyle ilişkilendirilmesi gerekiyor. Lütfen yöneticinizle
          iletişime geçin.
        </p>
      </div>
    </div>
  );
}

export function ConsultantBlockedTimesManager() {
  const { consultantId, hasConsultant } = useMyConsultant();
  const router = useRouter();
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteBlockedTime();

  const query = useBlockedTimesQuery(
    { consultant_id: consultantId ?? "" },
    { enabled: hasConsultant }
  );
  const blockedTimes = (query.data ?? []).filter(
    (item) => String(item.consultant_id) === String(consultantId)
  );

  if (!hasConsultant) return <NoConsultantNotice />;

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Kapalı zaman silindi", type: "success" });
        setDeleting(null);
      },
      onError: (error) => {
        toast.add({
          title: "Silme başarısız",
          description: getErrorMessage(error),
          type: "error",
        });
        setDeleting(null);
      },
    });
  };

  return (
    <div className="w-full flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Kapalı Zamanlar
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {blockedTimes.length} kayıt · yalnızca kendi kapalı zamanlarınız
          </p>
        </div>
        <Button
          size="lg"
          className="h-10"
          onClick={() => router.push(`${LIST_PATH}/yeni`)}
        >
          <Plus className="size-4" />
          Yeni Kapalı Zaman
        </Button>
      </div>

      <div className="mt-4">
        {query.isPending && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {query.isError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
            <CircleAlert className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {getErrorMessage(query.error)}
            </p>
            <Button variant="outline" onClick={() => query.refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && blockedTimes.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <p className="text-sm font-medium">Henüz kapalı zamanınız yok</p>
            <p className="text-sm text-muted-foreground">
              Müsait olmadığınız ilk zaman aralığını ekleyerek başlayın
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`${LIST_PATH}/yeni`)}
            >
              <Plus className="size-4" />
              Yeni Kapalı Zaman
            </Button>
          </div>
        )}

        {query.isSuccess && blockedTimes.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Başlangıç</TableHead>
                    <TableHead>Bitiş</TableHead>
                    <TableHead>Sebep</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedTimes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 font-medium">
                        {item.startAtLabel}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.endAtLabel}
                      </TableCell>
                      <TableCell className="max-w-64 truncate text-muted-foreground">
                        {item.reason || "—"}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              router.push(`${LIST_PATH}/${item.id}`)
                            }
                            aria-label={`${item.startAtLabel} kapalı zamanı düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(item)}
                            aria-label={`${item.startAtLabel} kapalı zamanı sil`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {blockedTimes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <p className="truncate font-medium">
                    {item.startAtLabel} - {item.endAtLabel}
                  </p>
                  {item.reason && (
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {item.reason}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1"
                      onClick={() => router.push(`${LIST_PATH}/${item.id}`)}
                    >
                      <Pencil className="size-3.5" />
                      Düzenle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1 text-destructive hover:text-destructive"
                      onClick={() => setDeleting(item)}
                    >
                      <Trash2 className="size-3.5" />
                      Sil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kapalı zamanı sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.startAtLabel ?? ""} -{" "}
              {deleting?.endAtLabel ?? ""}
              &quot; kaydı silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-10"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function toFormValues(blockedTime) {
  return {
    start_at: blockedTime?.start_at ? blockedTime.start_at.slice(0, 16) : "",
    end_at: blockedTime?.end_at ? blockedTime.end_at.slice(0, 16) : "",
    reason: blockedTime?.reason ?? "",
  };
}

function toPayloadDateTime(value) {
  return `${value.replace("T", " ")}:00`;
}

function ConsultantBlockedTimeForm({ isEdit, item }) {
  const { user, consultantId } = useMyConsultant();
  const router = useRouter();
  const create = useCreateBlockedTime();
  const update = useUpdateBlockedTime();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(blockedTimeSchema.shape);

  const form = useForm({
    resolver: zodResolver(blockedTimeSchema),
    defaultValues: toFormValues(item),
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
      consultant_id: consultantId,
      start_at: toPayloadDateTime(values.start_at),
      end_at: toPayloadDateTime(values.end_at),
      reason: values.reason.trim() ? values.reason.trim() : null,
    };
    if (isEdit) {
      update.mutate(
        { id: item.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Kapalı zaman güncellendi", type: "success" });
            router.push(LIST_PATH);
          },
          onError: handleError,
        }
      );
      return;
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Kapalı zaman eklendi", type: "success" });
        router.push(LIST_PATH);
      },
      onError: handleError,
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label>Danışman</Label>
        <p className="text-sm text-muted-foreground">
          {user?.name ?? user?.first_name ?? "Kendi hesabınız"} (kendi
          kayıtlarınız)
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="start_at">Başlangıç</Label>
        <Input
          id="start_at"
          type="datetime-local"
          aria-invalid={Boolean(form.formState.errors.start_at)}
          {...form.register("start_at")}
        />
        {form.formState.errors.start_at && (
          <p className="text-xs text-destructive">
            {form.formState.errors.start_at.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="end_at">Bitiş</Label>
        <Input
          id="end_at"
          type="datetime-local"
          aria-invalid={Boolean(form.formState.errors.end_at)}
          {...form.register("end_at")}
        />
        {form.formState.errors.end_at && (
          <p className="text-xs text-destructive">
            {form.formState.errors.end_at.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reason">Sebep</Label>
        <Textarea
          id="reason"
          rows={2}
          placeholder="Örn. Eğitim, izin (opsiyonel)"
          maxLength={255}
          {...form.register("reason")}
        />
        {form.formState.errors.reason && (
          <p className="text-xs text-destructive">
            {form.formState.errors.reason.message}
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
          {mutation.isPending ? "Kaydediliyor..." : isEdit ? "Kaydet" : "Ekle"}
        </Button>
      </div>
    </form>
  );
}

export function ConsultantBlockedTimeCreatePage() {
  const { hasConsultant } = useMyConsultant();

  if (!hasConsultant) return <NoConsultantNotice />;

  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Kapalı Zamanlar"
      title="Yeni Kapalı Zaman"
      description="Müsait olmadığınız kendi zaman aralığınızı tanımlayın"
      cardTitle="Kapalı Zaman Bilgileri"
    >
      <ConsultantBlockedTimeForm isEdit={false} item={null} />
    </AdminFormPage>
  );
}

export function ConsultantBlockedTimeEditPage({ id }) {
  const { consultantId, hasConsultant } = useMyConsultant();
  const query = useBlockedTimesQuery(
    { consultant_id: consultantId ?? "" },
    { enabled: hasConsultant }
  );
  const items = (query.data ?? []).filter(
    (item) => String(item.consultant_id) === String(consultantId)
  );
  const item = items.find((x) => String(x.id) === String(id));

  if (!hasConsultant) return <NoConsultantNotice />;

  if (query.isPending) {
    return (
      <AdminFormPage
        backHref={LIST_PATH}
        backLabel="Kapalı Zamanlar"
        title="Kapalı Zamanı Düzenle"
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
        backLabel="Kapalı Zamanlar"
        title="Kapalı Zamanı Düzenle"
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

  if (!item) {
    return (
      <AdminFormPage
        backHref={LIST_PATH}
        backLabel="Kapalı Zamanlar"
        title="Kapalı Zamanı Düzenle"
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">Kayıt bulunamadı.</p>
          <Link
            className="text-sm text-muted-foreground hover:text-foreground"
            href={LIST_PATH}
          >
            ← Listeye Dön
          </Link>
        </div>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Kapalı Zamanlar"
      title="Kapalı Zamanı Düzenle"
      description={`${item.startAtLabel} - ${item.endAtLabel}`}
      cardTitle="Kapalı Zaman Bilgileri"
    >
      <ConsultantBlockedTimeForm key={item.id} isEdit item={item} />
    </AdminFormPage>
  );
}
