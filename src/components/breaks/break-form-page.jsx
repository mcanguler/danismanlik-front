"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useConsultantsQuery } from "@/lib/consultants";
import {
  dayLabel,
  DAYS,
  useBreaksQuery,
  useCreateBreak,
  useUpdateBreak,
} from "@/lib/breaks";
import { AdminFormPage } from "@/components/admin/admin-form-page";

const LIST_PATH = "/dashboard/admin/molalar";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const breakSchema = z
  .object({
    consultant_id: z.coerce
      .number({ message: "Danışman seçin" })
      .int({ message: "Danışman seçin" })
      .min(1, "Danışman seçin"),
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
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "Bitiş saati başlangıç saatinden sonra olmalıdır",
    path: ["end_time"],
  });

function toFormValues(breakItem) {
  return {
    consultant_id: breakItem?.consultant_id ?? "",
    day_of_week: breakItem?.day_of_week ?? "",
    start_time: breakItem?.start_time ?? "",
    end_time: breakItem?.end_time ?? "",
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function BreakCreatePage() {
  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Molalar"
      title="Yeni Mola"
      description="Danışman için mola tanımlayın — mola, çalışma saatleri içinde olmalıdır"
      cardTitle="Mola Bilgileri"
    >
      <BreakForm isEdit={false} item={null} />
    </AdminFormPage>
  );
}

export function BreakEditPage({ id }) {
  const query = useBreaksQuery();
  const item = (query.data ?? []).find((x) => String(x.id) === String(id));

  if (query.isPending) {
    return (
      <AdminFormPage
        backHref={LIST_PATH}
        backLabel="Molalar"
        title="Molayı Düzenle"
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
        backLabel="Molalar"
        title="Molayı Düzenle"
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
        backLabel="Molalar"
        title="Molayı Düzenle"
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
      backLabel="Molalar"
      title="Molayı Düzenle"
      description={`${item.consultantName} · ${dayLabel(item.day_of_week)} ${item.start_time}-${item.end_time}`}
      cardTitle="Mola Bilgileri"
    >
      <BreakForm key={item.id} isEdit item={item} />
    </AdminFormPage>
  );
}

function BreakForm({ isEdit, item }) {
  const router = useRouter();
  const create = useCreateBreak();
  const update = useUpdateBreak();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(breakSchema.shape);

  const consultantsQuery = useConsultantsQuery();
  const consultants = consultantsQuery.data ?? [];

  const form = useForm({
    resolver: zodResolver(breakSchema),
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
      consultant_id: Number(values.consultant_id),
      day_of_week: Number(values.day_of_week),
      start_time: values.start_time,
      end_time: values.end_time,
    };
    if (isEdit) {
      update.mutate(
        { id: item.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Mola güncellendi", type: "success" });
            router.push(LIST_PATH);
          },
          onError: handleError,
        }
      );
      return;
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Mola eklendi", type: "success" });
        router.push(LIST_PATH);
      },
      onError: handleError,
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Controller
        control={form.control}
        name="consultant_id"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="consultant_id">Danışman</Label>
            {consultantsQuery.isPending ? (
              <div className="flex h-8 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Yükleniyor...
              </div>
            ) : (
              <select
                id="consultant_id"
                className={selectClassName}
                aria-invalid={Boolean(form.formState.errors.consultant_id)}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                <option value="">Danışman seçin</option>
                {consultants.map((consultant) => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.name}
                  </option>
                ))}
              </select>
            )}
            {form.formState.errors.consultant_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.consultant_id.message}
              </p>
            )}
          </div>
        )}
      />
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
