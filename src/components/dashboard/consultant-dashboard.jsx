"use client";

import Link from "next/link";
import { CalendarDays, CalendarClock, CircleAlert, Clock, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUSES,
  formatDateLabel,
  formatTimeLabel,
  useAppointmentsQuery,
} from "@/lib/appointments";

function localDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function byStartAt(a, b) {
  return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
}

function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        APPOINTMENT_STATUS_BADGE_CLASSES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {APPOINTMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentList({ appointments, emptyText }) {
  if (appointments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
    );
  }

  return (
    <ul className="flex flex-col divide-y">
      {appointments.map((appointment) => (
        <li key={appointment.id}>
          <Link
            className="flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:bg-accent/30"
            href={`/appointments/${appointment.id}/edit`}
          >
            <div className="min-w-0">
              <p className="truncate font-medium">
                {appointment.customerName || "Müşteri"}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {appointment.serviceName ?? "—"} ·{" "}
                {formatDateLabel(appointment.startAt)}{" "}
                {formatTimeLabel(appointment.startAt)}
              </p>
            </div>
            <StatusBadge status={appointment.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ConsultantDashboard() {
  const query = useAppointmentsQuery();
  const appointments = query.data ?? [];

  if (query.isPending) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
        <CircleAlert className="size-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Randevular yüklenemedi.
        </p>
        <Button variant="outline" onClick={() => query.refetch()}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const todayKey = localDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = localDateKey(tomorrow);

  const active = appointments.filter(
    (appointment) => appointment.status !== APPOINTMENT_STATUSES.CANCELLED
  );

  const todayAppointments = active
    .filter((appointment) => localDateKey(appointment.startAt) === todayKey)
    .sort(byStartAt);
  const tomorrowAppointments = active
    .filter((appointment) => localDateKey(appointment.startAt) === tomorrowKey)
    .sort(byStartAt);
  const pendingRequests = active
    .filter((appointment) => appointment.status === APPOINTMENT_STATUSES.PENDING)
    .sort(byStartAt);
  const upcoming = [...todayAppointments, ...tomorrowAppointments].sort(byStartAt);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={CalendarDays}
          label="Bugünkü Randevular"
          value={todayAppointments.length}
        />
        <SummaryCard
          icon={CalendarClock}
          label="Yarınki Randevular"
          value={tomorrowAppointments.length}
        />
        <SummaryCard
          icon={Clock}
          label="Onay Bekleyen"
          value={pendingRequests.length}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bugün ve Yarın</CardTitle>
          <CardDescription>Yaklaşan randevularınız</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentList
            appointments={upcoming}
            emptyText="Bugün ve yarın için randevunuz yok."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Onay Bekleyen Talepler</CardTitle>
          <CardDescription>Onayınızı bekleyen randevular</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentList
            appointments={pendingRequests}
            emptyText="Onay bekleyen talep yok."
          />
        </CardContent>
      </Card>
    </div>
  );
}
