"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/ui/status-badge";
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
  dayLabel,
  DAYS,
  useCreateWorkingHour,
  useDeleteWorkingHour,
  useUpdateWorkingHour,
  useWorkingHoursQuery,
} from "@/lib/working-hours";
import { AdminFormPage } from "@/components/admin/admin-form-page";

const LIST_PATH = "/dashboard/consultant/calisma-saatleri";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const workingHourSchema = z
  .object({
    day_of_week: z.coerce
      .number({ message: "Gün seçin" })
      .int({ message: "Gün seçin" })
      .min(1, "Gün seçin")
      .max(7, "Gün seçin"),
    start_time: z
      .string()
      .min(1, "Başlangıç saati zorunludur")
      .regex(timeRegex, "Geçerli bir başlangıç saati girin"),
    end_time: z
      .string()
      .min(1, "Bitiş saati zorunludur")
      .regex(timeRegex, "Geçerli bir bitiş saati girin"),
    is_active: z.boolean(),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "Bitiş saati başlangıç saatinden sonra olmalıdır",
    path: ["end_time"],
  });

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function NoConsultantNotice() {
  return (
    <div className="w-full flex-1 px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">
        Çalışma Saatleri
      </h1>
      <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
        <CircleAlert className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">Danışman profiliniz bulunamadı</p>
        <p className="text-sm text-muted-foreground">
          Çalışma saatlerinizi yönetebilmeniz için hesabınızın bir danışman
          profiliyle ilişkilendirilmesi gerekiyor. Lütfen yöneticinizle
          iletişime geçin.
        </p>
      </div>
    </div>
  );
}

export function ConsultantWorkingHoursManager() {
  const { consultantId, hasConsultant } = useMyConsultant();
  const router = useRouter();
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteWorkingHour();

  const query = useWorkingHoursQuery(
    { consultant_id: consultantId ?? "" },
    { enabled: hasConsultant }
  );
  const workingHours = (query.data ?? []).filter(
    (item) => String(item.consultant_id) === String(consultantId)
  );

  if (!hasConsultant) return <NoConsultantNotice />;

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Çalışma saati silindi", type: "success" });
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
            Çalışma Saatleri
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {workingHours.length} kayıt · yalnızca kendi çalışma saatleriniz
          </p>
        </div>
        <Button
          size="lg"
          className="h-10"
          onClick={() => router.push(`${LIST_PATH}/yeni`)}
        >
          <Plus className="size-4" />
          Yeni Çalışma Saati
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

        {query.isSuccess && workingHours.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <p className="text-sm font-medium">Henüz çalışma saatiniz yok</p>
            <p className="text-sm text-muted-foreground">
              İlk çalışma saatinizi ekleyerek başlayın
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`${LIST_PATH}/yeni`)}
            >
              <Plus className="size-4" />
              Yeni Çalışma Saati
            </Button>
          </div>
        )}

        {query.isSuccess && workingHours.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Gün</TableHead>
                    <TableHead>Başlangıç</TableHead>
                    <TableHead>Bitiş</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workingHours.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 font-medium">
                        {dayLabel(item.day_of_week)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.start_time}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.end_time}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={item.is_active} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              router.push(`${LIST_PATH}/${item.id}`)
                            }
                            aria-label={`${dayLabel(item.day_of_week)} düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(item)}
                            aria-label={`${dayLabel(item.day_of_week)} sil`}
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
              {workingHours.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate font-medium">
                      {dayLabel(item.day_of_week)}
                    </p>
                    <StatusBadge active={item.is_active} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.start_time} - {item.end_time}
                  </p>
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
            <AlertDialogTitle>Çalışma saatini sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{dayLabel(deleting?.day_of_week)}{" "}
              {deleting?.start_time ?? ""}-{deleting?.end_time ?? ""}
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

function toFormValues(workingHour) {
  return {
    day_of_week: workingHour?.day_of_week ?? "",
    start_time: workingHour?.start_time ?? "",
    end_time: workingHour?.end_time ?? "",
    is_active: workingHour ? Boolean(workingHour.is_active) : true,
  };
}

function ConsultantWorkingHourForm({ isEdit, item }) {
  const { user, consultantId } = useMyConsultant();
  const router = useRouter();
  const create = useCreateWorkingHour();
  const update = useUpdateWorkingHour();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(workingHourSchema.shape);

  const form = useForm({
    resolver: zodResolver(workingHourSchema),
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
      day_of_week: Number(values.day_of_week),
      start_time: values.start_time,
      end_time: values.end_time,
      is_active: values.is_active,
    };
    if (isEdit) {
      update.mutate(
        { id: item.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Çalışma saati güncellendi", type: "success" });
            router.push(LIST_PATH);
          },
          onError: handleError,
        }
      );
      return;
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Çalışma saati eklendi", type: "success" });
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
      <Controller
        control={form.control}
        name="day_of_week"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="day_of_week">Gün</Label>
            <select
              id="day_of_week"
              className={selectClassName}
              aria-invalid={Boolean(form.formState.errors.day_of_week)}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            >
              <option value="">Gün seçin</option>
              {DAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
            {form.formState.errors.day_of_week && (
              <p className="text-xs text-destructive">
                {form.formState.errors.day_of_week.message}
              </p>
            )}
          </div>
        )}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_time">Başlangıç Saati</Label>
          <Input
            id="start_time"
            type="time"
            aria-invalid={Boolean(form.formState.errors.start_time)}
            {...form.register("start_time")}
          />
          {form.formState.errors.start_time && (
            <p className="text-xs text-destructive">
              {form.formState.errors.start_time.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_time">Bitiş Saati</Label>
          <Input
            id="end_time"
            type="time"
            aria-invalid={Boolean(form.formState.errors.end_time)}
            {...form.register("end_time")}
          />
          {form.formState.errors.end_time && (
            <p className="text-xs text-destructive">
              {form.formState.errors.end_time.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="is_active">Aktif</Label>
          <p className="text-xs text-muted-foreground">
            Çalışma saatinin aktif/pasif durumu
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

export function ConsultantWorkingHourCreatePage() {
  const { hasConsultant } = useMyConsultant();

  if (!hasConsultant) return <NoConsultantNotice />;

  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Çalışma Saatleri"
      title="Yeni Çalışma Saati"
      description="Kendi çalışma saatinizi tanımlayın"
      cardTitle="Çalışma Saati Bilgileri"
    >
      <ConsultantWorkingHourForm isEdit={false} item={null} />
    </AdminFormPage>
  );
}

export function ConsultantWorkingHourEditPage({ id }) {
  const { consultantId, hasConsultant } = useMyConsultant();
  const query = useWorkingHoursQuery(
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
        backLabel="Çalışma Saatleri"
        title="Çalışma Saatini Düzenle"
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
        backLabel="Çalışma Saatleri"
        title="Çalışma Saatini Düzenle"
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
        backLabel="Çalışma Saatleri"
        title="Çalışma Saatini Düzenle"
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
      backLabel="Çalışma Saatleri"
      title="Çalışma Saatini Düzenle"
      description={`${dayLabel(item.day_of_week)} ${item.start_time}-${item.end_time}`}
      cardTitle="Çalışma Saati Bilgileri"
    >
      <ConsultantWorkingHourForm key={item.id} isEdit item={item} />
    </AdminFormPage>
  );
}
