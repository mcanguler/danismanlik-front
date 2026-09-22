"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_LABELS,
  formatDateLabel,
  formatTimeLabel,
  getErrorMessage,
  useAppointmentQuery,
  useUpdateAppointment,
} from "@/lib/appointments";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";

const selectClassName =
  "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

const STATUS_OPTIONS = [
  APPOINTMENT_STATUSES.PENDING,
  APPOINTMENT_STATUSES.CONFIRMED,
  APPOINTMENT_STATUSES.COMPLETED,
  APPOINTMENT_STATUSES.CANCELLED,
];

function fieldErrorsFromApiError(error) {
  if (!(error instanceof ApiError) || !error.errors) return {};
  const fieldErrors = {};
  for (const [field, messages] of Object.entries(error.errors)) {
    if (!["notes", "status"].includes(field)) continue;
    fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages;
  }
  return fieldErrors;
}

function EditFormContent({ appointment }) {
  const router = useRouter();
  const endSession = useAuthStore((state) => state.endSession);
  const update = useUpdateAppointment();

  const [status, setStatus] = useState(appointment.status);
  const [notes, setNotes] = useState(appointment.notes ?? "");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors({});
    update.mutate(
      {
        id: appointment.id,
        payload: {
          status,
          notes: notes.trim() ? notes.trim() : null,
        },
      },
      {
        onSuccess: () => {
          toast.add({ title: "Randevu güncellendi", type: "success" });
          router.push("/appointments");
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 401) {
            endSession();
            return;
          }
          const fieldErrors = fieldErrorsFromApiError(error);
          if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
          toast.add({
            title: "Randevu güncellenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {appointment.customerName}
                </p>
                <p className="mt-0.5 truncate text-muted-foreground">
                  {appointment.consultantName}
                  {appointment.serviceName ? ` · ${appointment.serviceName}` : ""}
                </p>
              </div>
              <AppointmentStatusBadge status={appointment.status} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDateLabel(appointment.startAt)} ·{" "}
              {formatTimeLabel(appointment.startAt)}
              {appointment.endAt
                ? ` - ${formatTimeLabel(appointment.endAt)}`
                : ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Durum</Label>
            <select
              id="status"
              className={selectClassName}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {APPOINTMENT_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-destructive">{errors.status}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Not</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Randevu ile ilgili notlar"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes}</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              render={<Link href="/appointments" />}
            >
              Vazgeç
            </Button>
            <Button type="submit" className="h-10" disabled={update.isPending}>
              {update.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {update.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function AppointmentEditForm({ id }) {
  const endSession = useAuthStore((state) => state.endSession);
  const query = useAppointmentQuery(id);

  useEffect(() => {
    if (query.isError && query.error instanceof ApiError && query.error.status === 401) {
      endSession();
    }
  }, [query.isError, query.error, endSession]);

  const apiError =
    query.isError && query.error instanceof ApiError ? query.error : null;

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Randevuyu Düzenle
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Randevunun durumunu ve notlarını güncelleyin
        </p>
      </div>

      {query.isPending && (
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {query.isError && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
          <CircleAlert className="size-6 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {apiError?.status === 404
              ? "Kayıt bulunamadı"
              : getErrorMessage(query.error)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {apiError?.status !== 404 && (
              <Button variant="outline" onClick={() => query.refetch()}>
                Tekrar Dene
              </Button>
            )}
            <Button variant="outline" render={<Link href="/appointments" />}>
              Randevulara Dön
            </Button>
          </div>
        </div>
      )}

      {query.isSuccess && query.data && (
        <EditFormContent key={query.data.id} appointment={query.data} />
      )}
    </div>
  );
}
