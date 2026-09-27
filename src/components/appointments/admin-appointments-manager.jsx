"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  List,
  LoaderCircle,
  Pencil,
  Search,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { useConsultantsQuery } from "@/lib/consultants";
import { useCustomersQuery } from "@/lib/customers";
import { useConsultantServicesQuery } from "@/lib/consultant-services";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUSES,
  formatDateLabel,
  formatTimeLabel,
  getErrorMessage,
  useAdminAppointmentsQuery,
} from "@/lib/appointments";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";

const PAGE_SIZE = 15;

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

const selectClassName =
  "h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

function toIsoDate(date) {
  return format(date, "yyyy-MM-dd");
}

function parseIso(value) {
  if (!value) return null;
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border px-4 py-12 text-center">
      <CalendarDays className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">
        Filtreleri değiştirerek tekrar deneyebilirsiniz.
      </p>
    </div>
  );
}

function MonthCalendar({ monthAnchor, onMonthChange, appointments }) {
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const byDay = useMemo(() => {
    const map = new Map();
    for (const appointment of appointments) {
      const date = parseIso(appointment.startAt);
      if (!date) continue;
      const key = format(date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(appointment);
    }
    return map;
  }, [appointments]);

  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedKey = toIsoDate(selectedDay);
  const selectedAppointments = byDay.get(selectedKey) ?? [];

  const sortedSelected = [...selectedAppointments].sort((a, b) =>
    String(a.startAt).localeCompare(String(b.startAt))
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            aria-label="Önceki ay"
            onClick={() => onMonthChange(new Date(year, month - 1, 1))}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-40 text-center text-sm font-semibold tracking-tight">
            {MONTH_NAMES[month]} {year}
          </span>
          <Button
            aria-label="Sonraki ay"
            onClick={() => onMonthChange(new Date(year, month + 1, 1))}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button
          onClick={() => {
            const now = new Date();
            onMonthChange(new Date(now.getFullYear(), now.getMonth(), 1));
            setSelectedDay(now);
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          Bugün
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
          {WEEK_DAYS.map((day) => (
            <div className="py-2" key={day}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, index) => {
            if (!date) {
              return <div className="min-h-24 border-b border-r last:border-r-0" key={`blank-${index}`} />;
            }
            const key = toIsoDate(date);
            const dayAppointments = byDay.get(key) ?? [];
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDay);
            return (
              <button
                className={cn(
                  "min-h-24 border-b border-r p-1.5 text-left align-top last:border-r-0 hover:bg-accent/40 transition-colors",
                  isSelected && "bg-accent/50"
                )}
                key={key}
                onClick={() => setSelectedDay(date)}
                type="button"
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday && "bg-primary text-primary-foreground"
                  )}
                >
                  {date.getDate()}
                </span>
                <div className="mt-1 flex flex-col gap-0.5">
                  {dayAppointments.slice(0, 2).map((appointment) => (
                    <span
                      className={cn(
                        "truncate rounded border-l-2 bg-muted/50 px-1.5 py-0.5 text-[10px] leading-tight text-muted-foreground",
                        STATUS_CHIP_CLASSES[appointment.status]
                      )}
                      key={appointment.id}
                    >
                      {formatTimeLabel(appointment.startAt)}{" "}
                      {appointment.customerName}
                    </span>
                  ))}
                  {dayAppointments.length > 2 && (
                    <span className="px-1.5 text-[10px] font-medium text-muted-foreground">
                      +{dayAppointments.length - 2} daha
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
          <h3 className="text-sm font-semibold tracking-tight">
            {formatDateLabel(selectedKey)} günü randevular
          </h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {sortedSelected.length}
          </span>
        </div>
        {sortedSelected.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Bu gün için randevu bulunmuyor.
          </p>
        ) : (
          <div className="divide-y">
            {sortedSelected.map((appointment) => (
              <div
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                key={appointment.id}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {formatTimeLabel(appointment.startAt)}
                    {appointment.endAt ? ` - ${formatTimeLabel(appointment.endAt)}` : ""}{" "}
                    · {appointment.customerName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {appointment.consultantName}
                    {appointment.serviceName ? ` · ${appointment.serviceName}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AppointmentStatusBadge status={appointment.status} />
                  <Button
                    aria-label="Randevuyu düzenle"
                    render={<Link href={`/appointments/${appointment.id}/edit`} />}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminAppointmentsManager() {
  const endSession = useAuthStore((state) => state.endSession);

  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    consultant_id: "",
    customer_id: "",
    consultant_service_id: "",
    status: "",
    time: "",
    start_from: "",
    start_to: "",
    search: "",
  });
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const listQuery = useAdminAppointmentsQuery(
    { ...filters, page, per_page: PAGE_SIZE },
    { enabled: view === "list" }
  );

  const monthFrom = toIsoDate(monthAnchor);
  const monthTo = toIsoDate(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0));
  const calendarQuery = useAdminAppointmentsQuery(
    {
      consultant_id: filters.consultant_id,
      customer_id: filters.customer_id,
      consultant_service_id: filters.consultant_service_id,
      status: filters.status,
      time: filters.time,
      search: filters.search,
      start_from: monthFrom,
      start_to: monthTo,
      per_page: 200,
      page: 1,
    },
    { enabled: view === "calendar" }
  );

  const activeQuery = view === "list" ? listQuery : calendarQuery;

  useEffect(() => {
    if (activeQuery.isError && activeQuery.error instanceof ApiError && activeQuery.error.status === 401) {
      endSession();
      toast.add({
        title: "Oturumunuz sona erdi",
        description: "Lütfen tekrar giriş yapın.",
        type: "error",
      });
    }
  }, [activeQuery.isError, activeQuery.error, endSession]);

  const consultantsQuery = useConsultantsQuery({ is_active: "1" });
  const customersQuery = useCustomersQuery();
  const servicesQuery = useConsultantServicesQuery();

  const appointments = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const calendarAppointments = calendarQuery.data?.items ?? [];

  return (
    <div className="w-full flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Randevular</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {view === "list" && meta ? `${meta.total} randevu` : "Tüm randevular"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Takvim görünümü"
            onClick={() => setView("calendar")}
            size="sm"
            type="button"
            variant={view === "calendar" ? "default" : "outline"}
          >
            <CalendarDays className="size-4" />
            Takvim
          </Button>
          <Button
            aria-label="Liste görünümü"
            onClick={() => setView("list")}
            size="sm"
            type="button"
            variant={view === "list" ? "default" : "outline"}
          >
            <List className="size-4" />
            Liste
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-56 pl-8"
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Müşteri, danışman ara"
            type="text"
            value={filters.search}
          />
        </div>
        <select
          aria-label="Danışman filtresi"
          className={selectClassName}
          onChange={(event) => updateFilter("consultant_id", event.target.value)}
          value={filters.consultant_id}
        >
          <option value="">Tüm danışanlar</option>
          {(consultantsQuery.data ?? []).map((consultant) => (
            <option key={consultant.id} value={consultant.id}>
              {consultant.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Müşteri filtresi"
          className={selectClassName}
          onChange={(event) => updateFilter("customer_id", event.target.value)}
          value={filters.customer_id}
        >
          <option value="">Tüm müşteriler</option>
          {(customersQuery.data ?? []).map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Hizmet filtresi"
          className={selectClassName}
          onChange={(event) => updateFilter("consultant_service_id", event.target.value)}
          value={filters.consultant_service_id}
        >
          <option value="">Tüm hizmetler</option>
          {(servicesQuery.data ?? []).map((service) => (
            <option key={service.id} value={service.id}>
              {service.serviceName ?? service.name ?? `#${service.id}`}
            </option>
          ))}
        </select>
        <select
          aria-label="Durum filtresi"
          className={selectClassName}
          onChange={(event) => updateFilter("status", event.target.value)}
          value={filters.status}
        >
          <option value="">Tüm durumlar</option>
          {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Zaman filtresi"
          className={selectClassName}
          onChange={(event) => updateFilter("time", event.target.value)}
          value={filters.time}
        >
          <option value="">Tüm zamanlar</option>
          <option value="past">Geçmiş</option>
          <option value="upcoming">Gelecek</option>
        </select>
        <Input
          aria-label="Başlangıç tarihi"
          className="w-36"
          onChange={(event) => updateFilter("start_from", event.target.value)}
          type="date"
          value={filters.start_from}
        />
        <Input
          aria-label="Bitiş tarihi"
          className="w-36"
          onChange={(event) => updateFilter("start_to", event.target.value)}
          type="date"
          value={filters.start_to}
        />
      </div>

      {view === "calendar" && (filters.start_from || filters.start_to) && (
        <p className="mt-3 text-xs text-muted-foreground">
          Takvim görünümünde tarih aralığı filtresi yerine seçili ay
          kullanılır; diğer filtreler geçerlidir.
        </p>
      )}

      <div className="mt-4">
        {activeQuery.isPending && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {activeQuery.isError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
            <CircleAlert className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {getErrorMessage(activeQuery.error)}
            </p>
            <Button onClick={() => activeQuery.refetch()} variant="outline">
              Tekrar Dene
            </Button>
          </div>
        )}

        {view === "calendar" &&
          calendarQuery.isSuccess &&
          (calendarAppointments.length === 0 ? (
            <EmptyState label="Bu ay için randevu bulunmuyor" />
          ) : (
            <MonthCalendar
              appointments={calendarAppointments}
              monthAnchor={monthAnchor}
              onMonthChange={setMonthAnchor}
            />
          ))}

        {view === "list" && listQuery.isSuccess && appointments.length === 0 && (
          <EmptyState label="Randevu bulunamadı" />
        )}

        {view === "list" && listQuery.isSuccess && appointments.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Danışman</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Hizmet</TableHead>
                    <TableHead>Tarih / Saat</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="pl-4 font-medium">
                        {appointment.consultantName}
                      </TableCell>
                      <TableCell>{appointment.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {appointment.serviceName ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="font-medium">
                          {formatDateLabel(appointment.startAt)}
                        </span>
                        <span className="ml-1.5 text-muted-foreground">
                          {formatTimeLabel(appointment.startAt)}
                          {appointment.endAt
                            ? ` - ${formatTimeLabel(appointment.endAt)}`
                            : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <AppointmentStatusBadge status={appointment.status} />
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Button
                          aria-label="Randevuyu düzenle"
                          render={
                            <Link href={`/appointments/${appointment.id}/edit`} />
                          }
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {appointments.map((appointment) => (
                <div className="rounded-xl border bg-card p-4" key={appointment.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {appointment.customerName}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {appointment.consultantName}
                        {appointment.serviceName
                          ? ` · ${appointment.serviceName}`
                          : ""}
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
                  <div className="mt-3">
                    <Button
                      className="h-9 w-full"
                      render={
                        <Link href={`/appointments/${appointment.id}/edit`} />
                      }
                      size="sm"
                      variant="outline"
                    >
                      <Pencil className="size-3.5" />
                      Düzenle
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {meta && meta.lastPage > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  disabled={meta.currentPage <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  size="sm"
                  variant="outline"
                >
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">
                  Sayfa {meta.currentPage} / {meta.lastPage}
                </span>
                <Button
                  disabled={meta.currentPage >= meta.lastPage}
                  onClick={() => setPage((current) => current + 1)}
                  size="sm"
                  variant="outline"
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
