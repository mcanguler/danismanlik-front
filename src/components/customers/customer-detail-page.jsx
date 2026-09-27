/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  CircleAlert,
  CreditCard,
  GraduationCap,
  LoaderCircle,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone as PhoneIcon,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { ApiError } from "@/lib/api";
import { formatDateLabel, formatTimeLabel } from "@/lib/appointments";
import { ADDRESS_TYPE_LABELS, useCustomerDetailQuery } from "@/lib/customers";
import { formatDateTimeTr, formatPrice } from "@/lib/format";
import {
  normalizeOrder,
  normalizePayment,
  ORDER_ITEM_TYPE_LABELS,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_BADGE_CLASSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/orders";
import { cn } from "@/lib/utils";

const LIST_PATH = "/dashboard/admin/musteriler";

function getErrorMessage(error) {
  if (error instanceof ApiError && error.status === 404) {
    return "Müşteri bulunamadı";
  }
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 truncate font-medium">{children}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span className="truncate text-sm">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function EmptySection({ children }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>
  );
}

function addressTypeLabel(address) {
  const type = address?.type ?? address?.address_type;
  if (!type) return null;
  const key = String(type);
  return ADDRESS_TYPE_LABELS[key] ?? ADDRESS_TYPE_LABELS[key.toUpperCase()] ?? key;
}

function AddressCard({ address }) {
  const typeLabel = addressTypeLabel(address);
  const line =
    [
      address.line ?? address.address,
      address.district,
      address.city,
      address.country,
    ]
      .filter(Boolean)
      .join(", ") || null;

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium">{address.title || "Adres"}</p>
        {typeLabel && (
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            {typeLabel}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {line
          ? `${line}${address.postal_code ? ` · ${address.postal_code}` : ""}`
          : "Adres bilgisi yok"}
      </p>
    </div>
  );
}

function mapAppointment(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id,
    startAt: parseDate(raw.start_at),
    endAt: parseDate(raw.end_at),
    consultantName: raw.consultant?.name ?? raw.consultant_name ?? null,
    serviceName:
      raw.service?.name ??
      raw.consultant_service?.service?.name ??
      raw.service_name ??
      null,
    status: raw.status,
    notes: raw.notes ?? "",
  };
}

function AppointmentRow({ appointment }) {
  const dateLabel = appointment.startAt
    ? formatDateLabel(appointment.startAt.toISOString())
    : null;
  const timeLabel = appointment.startAt
    ? formatTimeLabel(appointment.startAt.toISOString())
    : null;
  const endLabel = appointment.endAt
    ? formatTimeLabel(appointment.endAt.toISOString())
    : null;

  return (
    <Link
      href={`/appointments/${appointment.id}/edit`}
      className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent/50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">
            {appointment.consultantName ?? "—"}
          </p>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {appointment.serviceName ?? "—"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{dateLabel ?? "—"}</span>
          {timeLabel && (
            <span className="ml-1.5">
              {timeLabel}
              {endLabel ? ` - ${endLabel}` : ""}
            </span>
          )}
        </p>
        {appointment.notes && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {appointment.notes}
          </p>
        )}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function AppointmentGroup({ title, items }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <AppointmentRow key={item.id ?? index} appointment={item} />
        ))}
      </div>
    </div>
  );
}

function OrderPaymentsSummary({ order }) {
  const payments = order.payments ?? [];
  if (payments.length === 0) return null;
  const paidTotal = payments.reduce((sum, payment) => {
    if (payment.status !== PAYMENT_STATUSES.SUCCESS) return sum;
    const amount = Number(payment.amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);
  return (
    <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
      {payments.length} ödeme
      {paidTotal > 0 ? ` · Ödenen ${formatPrice(paidTotal)}` : ""}
    </p>
  );
}

function OrderRow({ order }) {
  const items = order.items ?? [];

  return (
    <Link
      href={`/dashboard/admin/siparisler/${order.id}`}
      className="flex items-start justify-between gap-3 rounded-xl border p-4 transition-colors hover:bg-accent/50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm font-medium">
          {order.orderNo ?? `#${order.id ?? "?"}`}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDateTimeTr(order.createdAt) ?? "—"}
        </p>
        {items.length > 0 && (
          <div className="mt-2 flex flex-col gap-1 border-t pt-2 text-xs text-muted-foreground">
            {items.map((item, index) => {
              const unitPrice = formatPrice(item.unit_price);
              return (
                <p key={item.id ?? index} className="truncate">
                  {[
                    item.name ?? item.title ?? item.metadata?.name,
                    ORDER_ITEM_TYPE_LABELS[item.itemType] ?? item.itemType,
                    `${item.quantity ?? 1} adet`,
                    unitPrice,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              );
            })}
          </div>
        )}
        <OrderPaymentsSummary order={order} />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            ORDER_STATUS_BADGE_CLASSES[order.status] ?? "bg-muted text-muted-foreground"
          )}
        >
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
        <span className="whitespace-nowrap text-sm font-semibold">
          {formatPrice(order.totalAmount) ?? "—"}
        </span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function PaymentRow({ payment }) {
  return (
    <Link
      href={`/dashboard/admin/odemeler/${payment.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors hover:bg-accent/50"
    >
      <div className="min-w-0">
        <p className="truncate font-mono text-xs text-muted-foreground">
          {payment.merchantOid ?? "—"}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium">
          {formatPrice(payment.amount) ?? "—"} {payment.currency}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {payment.provider ?? "—"} · {formatDateTimeTr(payment.createdAt) ?? "—"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            PAYMENT_STATUS_BADGE_CLASSES[payment.status] ??
              "bg-muted text-muted-foreground"
          )}
        >
          {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
        </span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function mapServicePackage(raw) {
  if (!raw || typeof raw !== "object") return null;
  const pkg = raw.package && typeof raw.package === "object" ? raw.package : {};
  const rawItems = Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.package_items)
      ? raw.package_items
      : [];
  const total = toNumber(raw.total_quantity ?? raw.total ?? pkg.total_quantity);
  const used = toNumber(raw.used_quantity ?? raw.used ?? pkg.used_quantity);
  const remainingValue =
    toNumber(raw.remaining_quantity ?? raw.remaining ?? pkg.remaining_quantity) ??
    (total != null && used != null ? total - used : null);
  const remaining = remainingValue != null ? Math.max(0, remainingValue) : null;

  return {
    id: raw.id ?? pkg.id,
    name: pkg.name ?? raw.name ?? raw.title ?? "Paket",
    items: rawItems
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        return {
          id: item.id,
          name: item.service?.name ?? item.service_name ?? item.name ?? "—",
          quantity: toNumber(item.quantity),
        };
      })
      .filter(Boolean),
    total,
    used,
    remaining,
  };
}

function ServicePackageCard({ pkg }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="truncate text-sm font-medium">{pkg.name}</p>
      {pkg.items.length > 0 && (
        <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
          {pkg.items.map((item, index) => (
            <p key={item.id ?? index} className="truncate">
              {item.name}
              {item.quantity != null ? ` × ${item.quantity}` : ""}
            </p>
          ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
        <span>Toplam: {pkg.total ?? "—"}</span>
        <span>Kullanılan: {pkg.used ?? "—"}</span>
        <span>Kalan: {pkg.remaining ?? "—"}</span>
      </div>
    </div>
  );
}

function mapCourse(raw) {
  if (!raw || typeof raw !== "object") return null;
  const pivot = raw.pivot && typeof raw.pivot === "object" ? raw.pivot : {};
  return {
    id: raw.id,
    title: raw.title ?? raw.name ?? "Eğitim",
    image: raw.image ?? raw.thumbnail ?? null,
    createdAt: raw.created_at ?? pivot.created_at ?? null,
  };
}

function CourseRow({ course }) {
  const accessDate = formatDateTimeTr(course.createdAt);

  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      {course.image ? (
        <img
          src={course.image}
          alt={course.title}
          className="size-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
          <GraduationCap className="size-5 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{course.title}</p>
        {accessDate && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Erişim: {accessDate}
          </p>
        )}
      </div>
    </div>
  );
}

export function CustomerDetailPage({ id }) {
  const query = useCustomerDetailQuery(id);
  const [now] = useState(() => Date.now());
  const detail = query.data;

  if (query.isPending) {
    return (
      <div className="w-full flex-1 px-4 py-6">
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="w-full flex-1 px-4 py-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
          <CircleAlert className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Müşteri yüklenemedi</p>
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(query.error)}
          </p>
          <Button variant="outline" onClick={() => query.refetch()}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  const profile = detail.profile ?? null;
  const addresses = profile?.addresses ?? [];
  const stats = detail.stats ?? null;

  const sortedAppointments = (detail.appointments ?? [])
    .map(mapAppointment)
    .filter(Boolean)
    .sort((a, b) => {
      const left = a.startAt ? a.startAt.getTime() : Number.NEGATIVE_INFINITY;
      const right = b.startAt ? b.startAt.getTime() : Number.NEGATIVE_INFINITY;
      return right - left;
    });
  const upcomingAppointments = sortedAppointments.filter(
    (item) => item.startAt && item.startAt.getTime() > now
  );
  const pastAppointments = sortedAppointments.filter(
    (item) => !item.startAt || item.startAt.getTime() <= now
  );

  const orders = (detail.orders ?? []).map(normalizeOrder).filter(Boolean);
  const payments = (detail.payments ?? []).map(normalizePayment).filter(Boolean);
  const servicePackages = (detail.service_packages ?? [])
    .map(mapServicePackage)
    .filter(Boolean);
  const courses = (detail.courses ?? []).map(mapCourse).filter(Boolean);

  const statItems = [
    {
      icon: CalendarDays,
      label: "Randevu",
      value: stats ? stats.appointments : sortedAppointments.length,
    },
    {
      icon: ShoppingBag,
      label: "Sipariş",
      value: stats ? stats.orders : orders.length,
    },
    {
      icon: CreditCard,
      label: "Ödeme",
      value: stats ? stats.payments : payments.length,
    },
    {
      icon: Package,
      label: "Hizmet Paketi",
      value: stats ? stats.service_packages : servicePackages.length,
    },
  ];

  return (
    <div className="w-full flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href={LIST_PATH}
        >
          ← Müşteriler
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {profile?.name ?? "Müşteri Detayı"}
          </h1>
          <Button
            className="h-10"
            render={<Link href={`${LIST_PATH}/${id}/duzenle`} />}
            variant="outline"
          >
            <Pencil className="size-4" />
            Düzenle
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <InfoRow icon={PhoneIcon} label="Telefon">
                {profile?.phone || "—"}
              </InfoRow>
              <InfoRow icon={Mail} label="E-posta">
                {profile?.email || "—"}
              </InfoRow>
            </div>
            <div className="border-t pt-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4 text-muted-foreground" />
                Adresler
              </p>
              {addresses.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Kayıtlı adres yok
                </p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {addresses.map((address, index) => (
                    <AddressCard
                      key={address.id ?? address.title ?? index}
                      address={address}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statItems.map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Randevular</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedAppointments.length === 0 ? (
              <EmptySection>Randevu bulunmuyor</EmptySection>
            ) : (
              <div className="flex flex-col gap-5">
                {upcomingAppointments.length > 0 && (
                  <AppointmentGroup
                    title="Gelecek Randevular"
                    items={upcomingAppointments}
                  />
                )}
                {pastAppointments.length > 0 && (
                  <AppointmentGroup
                    title="Geçmiş Randevular"
                    items={pastAppointments}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <EmptySection>Sipariş bulunmuyor</EmptySection>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order, index) => (
                  <OrderRow key={order.id ?? index} order={order} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ödemeler</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <EmptySection>Ödeme bulunmuyor</EmptySection>
            ) : (
              <div className="flex flex-col gap-3">
                {payments.map((payment, index) => (
                  <PaymentRow key={payment.id ?? index} payment={payment} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hizmet Paketleri</CardTitle>
          </CardHeader>
          <CardContent>
            {servicePackages.length === 0 ? (
              <EmptySection>Hizmet paketi bulunmuyor</EmptySection>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {servicePackages.map((pkg, index) => (
                  <ServicePackageCard key={pkg.id ?? index} pkg={pkg} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eğitimler</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <EmptySection>Eğitim bulunmuyor</EmptySection>
            ) : (
              <div className="flex flex-col gap-3">
                {courses.map((course, index) => (
                  <CourseRow key={course.id ?? index} course={course} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
