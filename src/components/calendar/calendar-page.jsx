"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Layers,
  LoaderCircle,
  Pencil,
  UserRound,
  UsersRound,
} from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-hooks";
import { ROLES } from "@/lib/auth";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUSES,
  formatTimeLabel,
  getErrorMessage,
  useAppointmentsQuery,
  useCancelAppointment,
} from "@/lib/appointments";
import { useConsultantsQuery } from "@/lib/consultants";

const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const WEEK_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const STATUS_CHIP_CLASSES = {
  [APPOINTMENT_STATUSES.PENDING]: "border-l-amber-500",
  [APPOINTMENT_STATUSES.CONFIRMED]: "border-l-emerald-500",
  [APPOINTMENT_STATUSES.COMPLETED]: "border-l-muted-foreground/40",
  [APPOINTMENT_STATUSES.CANCELLED]: "border-l-destructive/60",
};

const STATUS_DOT_CLASSES = {
  [APPOINTMENT_STATUSES.PENDING]: "bg-amber-500",
  [APPOINTMENT_STATUSES.CONFIRMED]: "bg-emerald-500",
  [APPOINTMENT_STATUSES.COMPLETED]: "bg-muted-foreground/50",
  [APPOINTMENT_STATUSES.CANCELLED]: "bg-destructive",
};

function chipLabel(appointment, role) {
  return role === ROLES.CUSTOMER
    ? appointment.consultantName
    : appointment.customerName;
}

function parseIso(value) {
  if (!value) return null;
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayKey(date) {
  return format(date, "yyyy-MM-dd");
}

function timeRange(appointment) {
  const start = formatTimeLabel(appointment.startAt);
  const end = appointment.endAt ? formatTimeLabel(appointment.endAt) : null;
  return end ? `${start} - ${end}` : start;
}

export function CalendarPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === ROLES.ADMIN;

  const query = useAppointmentsQuery();
  const cancelAppointment = useCancelAppointment();
  const consultantsQuery = useConsultantsQuery(
    {},
    { enabled: isAdmin }
  );

  const [monthOffsetDate, setMonthOffsetDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [statusFilter, setStatusFilter] = useState("");
  const [consultantFilter, setConsultantFilter] = useState("");
  const [cancelling, setCancelling] = useState(null);

  const appointments = useMemo(() => query.data ?? [], [query.data]);

  const filtered = useMemo(() => {
    let list = appointments;
    if (statusFilter) {
      list = list.filter((appointment) => appointment.status === statusFilter);
    }
    if (isAdmin && consultantFilter) {
      list = list.filter(
        (appointment) =>
          String(appointment.consultantId ?? "") === String(consultantFilter)
      );
    }
    return list;
  }, [appointments, statusFilter, consultantFilter, isAdmin]);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const appointment of filtered) {
      const date = parseIso(appointment.startAt);
      if (!date) continue;
      const key = dayKey(date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(appointment);
    }
    for (const dayItems of map.values()) {
      dayItems.sort((a, b) =>
        String(a.startAt ?? "").localeCompare(String(b.startAt ?? ""))
      );
    }
    return map;
  }, [filtered]);

  const monthDays = useMemo(() => {
    const year = monthOffsetDate.getFullYear();
    const month = monthOffsetDate.getMonth();
    const first = new Date(year, month, 1);
    const weekday = (first.getDay() + 6) % 7; // Pazartesi = 0
    const start = new Date(year, month, 1 - weekday);
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [monthOffsetDate]);

  const monthLabel = `${MONTH_NAMES[monthOffsetDate.getMonth()]} ${monthOffsetDate.getFullYear()}`;

  const selectedKey = selectedDay ? dayKey(selectedDay) : null;
  const dayAppointments = selectedKey ? (byDay.get(selectedKey) ?? []) : [];
  const daySorted = [...dayAppointments].sort((a, b) =>
    String(a.startAt ?? "").localeCompare(String(b.startAt ?? ""))
  );

  const monthAppointmentCount = useMemo(() => {
    const year = monthOffsetDate.getFullYear();
    const month = monthOffsetDate.getMonth();
    return filtered.filter((appointment) => {
      const date = parseIso(appointment.startAt);
      return (
        date &&
        date.getFullYear() === year &&
        date.getMonth() === month &&
        appointment.status !== APPOINTMENT_STATUSES.CANCELLED
      );
    }).length;
  }, [filtered, monthOffsetDate]);

  const consultants = consultantsQuery.data ?? [];

  const handleCancel = () => {
    if (!cancelling) return;
    cancelAppointment.mutate(cancelling.id, {
      onSuccess: () => {
        toast.add({ title: "Randevu iptal edildi", type: "success" });
        setCancelling(null);
      },
      onError: (error) => {
        toast.add({
          title: "İptal başarısız",
          description: getErrorMessage(error),
          type: "error",
        });
        setCancelling(null);
      },
    });
  };

  const canCancel = (appointment) => {
    if (
      appointment?.status !== APPOINTMENT_STATUSES.PENDING &&
      appointment?.status !== APPOINTMENT_STATUSES.CONFIRMED
    ) {
      return false;
    }
    // Backend rol bazlı kapsamlar: danışman/danışan listelerini yalnızca
    // kendi randevularıyla görür; admin herkesi görür.
    return isAdmin || role === ROLES.CONSULTANT || role === ROLES.CUSTOMER;
  };

  const canEdit = () => {
    // Backend update policy: admin veya randevunun danışmanı.
    return isAdmin || role === ROLES.CONSULTANT;
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <CalendarDays className="size-5 text-primary" />
            Takvim
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isAdmin
              ? "Tüm randevuları görüntüleyin ve yönetin"
              : "Kendi randevularınızı görüntüleyin ve yönetin"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Durum filtresi"
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="">Tüm durumlar</option>
            {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {isAdmin && (
            <select
              aria-label="Danışman filtresi"
              className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              onChange={(event) => setConsultantFilter(event.target.value)}
              value={consultantFilter}
            >
              <option value="">Tüm danışmanlar</option>
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <div className="flex items-center gap-1">
              <Button
                aria-label="Önceki ay"
                onClick={() =>
                  setMonthOffsetDate(
                    new Date(
                      monthOffsetDate.getFullYear(),
                      monthOffsetDate.getMonth() - 1,
                      1
                    )
                  )
                }
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-40 text-center font-title-md text-title-md font-semibold">
                {monthLabel}
              </span>
              <Button
                aria-label="Sonraki ay"
                onClick={() =>
                  setMonthOffsetDate(
                    new Date(
                      monthOffsetDate.getFullYear(),
                      monthOffsetDate.getMonth() + 1,
                      1
                    )
                  )
                }
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {monthAppointmentCount} randevu
              </span>
              <Button
                onClick={() => {
                  const now = new Date();
                  setMonthOffsetDate(now);
                  setSelectedDay(now);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                Bugün
              </Button>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-7 gap-1.5">
              {WEEK_DAYS.map((day) => (
                <div
                  className="pb-1 text-center text-xs font-medium text-muted-foreground"
                  key={day}
                >
                  {day}
                </div>
              ))}
              {monthDays.map((day) => {
                const key = dayKey(day);
                const dayItems = byDay.get(key) ?? [];
                const inMonth = day.getMonth() === monthOffsetDate.getMonth();
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDay && isSameDay(day, selectedDay);

                return (
                  <button
                    aria-label={`${day.getDate()} ${MONTH_NAMES[day.getMonth()]} ${day.getFullYear()}`}
                    className={cn(
                      "flex min-h-16 flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors sm:min-h-24 lg:min-h-28",
                      inMonth ? "bg-background" : "bg-muted/30",
                      isSelected
                        ? "border-primary ring-2 ring-ring/30"
                        : "hover:bg-accent/40"
                    )}
                    key={key}
                    onClick={() => setSelectedDay(day)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-xs font-medium",
                        isToday && "bg-primary font-bold text-primary-foreground",
                        !isToday && (inMonth ? "text-foreground" : "text-muted-foreground/60")
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <span className="hidden flex-col gap-0.5 sm:flex">
                      {dayItems.slice(0, 2).map((appointment) => (
                        <span
                          className={cn(
                            "truncate rounded border-l-2 bg-muted/50 px-1 py-0.5 text-[10px] leading-tight",
                            STATUS_CHIP_CLASSES[appointment.status] ??
                              "border-l-muted-foreground"
                          )}
                          key={appointment.id}
                        >
                          {formatTimeLabel(appointment.startAt)}{" "}
                          {chipLabel(appointment, role)}
                        </span>
                      ))}
                      {dayItems.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{dayItems.length - 2} daha
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-0.5 sm:hidden">
                      {dayItems.slice(0, 3).map((appointment) => (
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            STATUS_DOT_CLASSES[appointment.status] ??
                              "bg-muted-foreground"
                          )}
                          key={appointment.id}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between gap-3 border-b p-4">
            <div>
              <h2 className="font-title-md text-title-md font-semibold">
                {selectedDay
                  ? format(selectedDay, "d MMMM yyyy")
                  : "Gün Seçin"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {dayAppointments.length} randevu
              </p>
            </div>
            {selectedDay && (
              <Button
                onClick={() => setSelectedDay(null)}
                size="sm"
                type="button"
                variant="ghost"
              >
                Temizle
              </Button>
            )}
          </div>
          <div className="p-4">
            {query.isPending && (
              <div className="flex justify-center py-10">
                <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {query.isError && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
                <CircleAlert className="size-5 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Randevular yüklenemedi
                </p>
                <Button
                  onClick={() => query.refetch()}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Tekrar Dene
                </Button>
              </div>
            )}

            {!query.isPending && !query.isError && !selectedDay && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center">
                <CalendarDays className="size-7 text-muted-foreground" />
                <p className="text-sm font-medium">Gün seçin</p>
                <p className="text-xs text-muted-foreground">
                  Takvimden bir güne tıklayarak o günün randevularını görün
                </p>
              </div>
            )}

            {!query.isPending && !query.isError && selectedDay && (
              <>
                {daySorted.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center">
                    <Clock className="size-7 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Bu günde randevu bulunmuyor
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {daySorted.map((appointment) => (
                      <div
                        className="flex flex-col gap-2 rounded-xl border p-3"
                        key={appointment.id}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {timeRange(appointment)}
                            </span>
                          </div>
                          <AppointmentStatusBadge status={appointment.status} />
                        </div>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          {role !== ROLES.CUSTOMER && (
                            <span className="flex items-center gap-1.5">
                              <UsersRound className="size-3.5 shrink-0" />
                              Danışan: {appointment.customerName}
                            </span>
                          )}
                          {role !== ROLES.CONSULTANT && (
                            <span className="flex items-center gap-1.5">
                              <UserRound className="size-3.5 shrink-0" />
                              Danışman: {appointment.consultantName}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Layers className="size-3.5 shrink-0" />
                            Hizmet: {appointment.serviceName ?? "—"}
                          </span>
                          {appointment.notes && (
                            <span className="line-clamp-2">
                              Not: {appointment.notes}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          {canEdit() && (
                            <Button
                              render={
                                <Link
                                  href={`/appointments/${appointment.id}/edit`}
                                />
                              }
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              <Pencil className="size-3.5" />
                              Düzenle
                            </Button>
                          )}
                          {canCancel(appointment) && (
                            <Button
                              className="text-destructive hover:text-destructive"
                              onClick={() => setCancelling(appointment)}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              İptal Et
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setCancelling(null);
        }}
        open={Boolean(cancelling)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Randevuyu iptal et</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelling
                ? `${formatTimeLabel(cancelling.startAt)} randevusu iptal edilecek. Bu işlem geri alınamaz.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={cancelAppointment.isPending}
              onClick={handleCancel}
              variant="destructive"
            >
              {cancelAppointment.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {cancelAppointment.isPending ? "İptal Ediliyor..." : "İptal Et"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
