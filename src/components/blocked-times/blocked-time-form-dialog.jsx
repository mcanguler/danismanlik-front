"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useConsultantsQuery } from "@/lib/consultants";
import {
  useCreateBlockedTime,
  useUpdateBlockedTime,
} from "@/lib/blocked-times";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

const dateTimeLocalRegex = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;

const blockedTimeSchema = z
  .object({
    consultant_id: z.coerce
      .number({ message: "Danışman seçin" })
      .int({ message: "Danışman seçin" })
      .min(1, "Danışman seçin"),
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

function toFormValues(blockedTime) {
  return {
    consultant_id: blockedTime?.consultant_id ?? "",
    start_at: blockedTime?.start_at ? blockedTime.start_at.slice(0, 16) : "",
    end_at: blockedTime?.end_at ? blockedTime.end_at.slice(0, 16) : "",
    reason: blockedTime?.reason ?? "",
  };
}

function toPayloadDateTime(value) {
  return `${value.replace("T", " ")}:00`;
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function BlockedTimeFormDialog({ open, blockedTime, onOpenChange }) {
  const isEdit = Boolean(blockedTime);
  const create = useCreateBlockedTime();
  const update = useUpdateBlockedTime();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(blockedTimeSchema.shape);

  const consultantsQuery = useConsultantsQuery();
  const consultants = consultantsQuery.data ?? [];

  const form = useForm({
    resolver: zodResolver(blockedTimeSchema),
    defaultValues: toFormValues(blockedTime),
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
      start_at: toPayloadDateTime(values.start_at),
      end_at: toPayloadDateTime(values.end_at),
      reason: values.reason.trim() ? values.reason.trim() : null,
    };
    if (isEdit) {
      update.mutate(
        { id: blockedTime.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Bloklu zaman güncellendi", type: "success" });
            onOpenChange(false);
          },
          onError: handleError,
        }
      );
      return;
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Bloklu zaman eklendi", type: "success" });
        onOpenChange(false);
      },
      onError: handleError,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Bloklu Zamanı Düzenle" : "Yeni Bloklu Zaman"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `${blockedTime.consultantName} · ${blockedTime.startAtLabel} - ${blockedTime.endAtLabel}`
              : "Danışman için müsait olmayan zaman aralığı tanımlayın"}
          </DialogDescription>
        </DialogHeader>
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
                    className={
                      "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                    }
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
                  : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}