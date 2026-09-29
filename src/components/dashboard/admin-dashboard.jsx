"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarRange,
  CircleAlert,
  CreditCard,
  LoaderCircle,
  PackageOpen,
  ReceiptText,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/appointments";
import {
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
} from "@/lib/orders";
import {
  formatDateTr,
  formatDateTimeTr,
  formatPrice,
  formatTimeTr,
  TR_WEEKDAYS_SHORT,
} from "@/lib/format";
import {
  useAdminDashboardQuery,
} from "@/lib/dashboard";

const KPI_CARDS = [
  {
    key: "appointmentsToday",
    label: "Bugünkü Randevular",
    icon: CalendarDays,
    kind: "count",
  },
  {
    key: "appointmentsThisMonth",
    label: "Bu Ay Randevular",
    icon: CalendarRange,
    kind: "count",
  },
  {
    key: "revenueThisMonth",
    label: "Bu Ay Ciro",
    icon: CreditCard,
    kind: "price",
  },
  {
    key: "newCustomers",
    label: "Yeni Müşteriler",
    icon: UserPlus,
    kind: "count",
  },
  {
    key: "pendingOrders",
    label: "Bekleyen Siparişler",
    icon: PackageOpen,
    kind: "count",
  },
  {
    key: "pendingPayments",
    label: "Bekleyen Ödemeler",
    icon: ReceiptText,
    kind: "count",
  },
];

const REVENUE_RANGES = {
  last7Days: { label: "7 Gün" },
  last30Days: { label: "30 Gün" },
};

const ALERT_LINKS = {
  pendingAppointments: {
    label: "Bekleyen randevular",
    href: "/dashboard/admin/randevular",
  },
  failedPayments: {
    label: "Başarısız ödemeler",
    href: "/dashboard/admin/odemeler",
  },
  unreadContactMessages: {
    label: "Okunmamış iletişimler",
    href: "/dashboard/admin/iletisim-formlari",
  },
  pendingBlogComments: {
    label: "Onay bekleyen blog yorumları",
    href: "/dashboard/admin/blog-yorumlari",
  },
};

function KpiValue({ value, kind }) {
  if (kind === "price") {
    return <span>{formatPrice(value) ?? "—"}</span>;
  }
  return <span>{value}</span>;
}

function KpiSection({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {KPI_CARDS.map((card) => (
        <Card className="gap-1 py-4" key={card.key}>
          <CardContent className="flex flex-col gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blush-surface text-primary-container">
              <card.icon className="size-4.5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {card.label}
            </span>
            <span className="text-xl font-semibold tracking-tight text-primary">
              <KpiValue kind={card.kind} value={stats[card.key]} />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RevenueChart({ revenue }) {
  const [range, setRange] = useState("last7Days");
  const series = revenue[range] ?? [];
  const max = Math.max(...series.map((row) => row.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ciro Grafiği</CardTitle>
        <CardDescription>Günlük tahsil edilen ciro</CardDescription>
        <CardAction>
          <div className="flex rounded-full bg-muted p-1">
            {Object.entries(REVENUE_RANGES).map(([value, config]) => (
              <button
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  range === value
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-muted-foreground hover:text-primary"
                )}
                key={value}
                type="button"
                onClick={() => setRange(value)}
              >
                {config.label}
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {series.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Ciro verisi bulunmuyor.
          </p>
        ) : (
          <div className="flex h-44 items-end gap-1 sm:gap-1.5">
            {series.map((row) => {
              const date = new Date(`${row.date}T00:00:00`);
              const label = Number.isNaN(date.getTime())
                ? row.date
                : range === "last7Days"
                  ? TR_WEEKDAYS_SHORT[(date.getDay() + 6) % 7]
                  : date.getDate();
              const height =
                max > 0 && row.amount > 0
                  ? Math.max((row.amount / max) * 100, 6)
                  : 0;
              return (
                <div
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                  key={row.date}
                  title={`${formatDateTr(row.date)} — ${formatPrice(row.amount) ?? "0 TL"}`}
                >
                  <div
                    className={cn(
                      "w-full rounded-t-md bg-primary-container/80 transition-all",
                      row.amount > 0 && "hover:bg-primary-container"
                    )}
                    style={{ height: `${height}%` }}
                  />
                  <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ classes, label }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        classes
      )}
    >
      {label}
    </span>
  );
}

function TodayAppointmentsCard({ appointments }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bugünkü Randevular</CardTitle>
        <CardDescription>
          {appointments.length > 0
            ? `${appointments.length} randevu planlandı`
            : "Bugün için planlanmış randevu yok"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Bugüne ait randevu bulunmuyor.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Saat</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Danışman</TableHead>
                <TableHead>Hizmet</TableHead>
                <TableHead className="pr-4">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="pl-4 font-medium">
                    {formatTimeTr(appointment.startAt) ?? "—"}
                  </TableCell>
                  <TableCell>{appointment.customerName}</TableCell>
                  <TableCell>{appointment.consultantName}</TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell className="pr-4">
                    <StatusBadge
                      classes={
                        APPOINTMENT_STATUS_BADGE_CLASSES[appointment.status]
                      }
                      label={
                        APPOINTMENT_STATUS_LABELS[appointment.status] ??
                        appointment.status
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function RecentOrdersCard({ orders }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Siparişler</CardTitle>
        <CardDescription>En son oluşturulan 10 sipariş</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Henüz sipariş bulunmuyor.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Sipariş No</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="pr-4">Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="pl-4 font-medium">
                    {order.orderNo}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{formatPrice(order.total) ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge
                      classes={ORDER_STATUS_BADGE_CLASSES[order.status]}
                      label={ORDER_STATUS_LABELS[order.status] ?? order.status}
                    />
                  </TableCell>
                  <TableCell className="pr-4">
                    {formatDateTimeTr(order.createdAt) ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function NewCustomersCard({ customers }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Müşteriler</CardTitle>
        <CardDescription>En son kayıt olan 10 müşteri</CardDescription>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Henüz müşteri kaydı bulunmuyor.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Ad</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>E-Posta</TableHead>
                <TableHead className="pr-4">Kayıt Tarihi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="pl-4 font-medium">
                    {customer.name}
                  </TableCell>
                  <TableCell>{customer.phone || "—"}</TableCell>
                  <TableCell className="max-w-48 truncate">
                    {customer.email || "—"}
                  </TableCell>
                  <TableCell className="pr-4">
                    {formatDateTr(customer.createdAt) ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AlertsCard({ alerts }) {
  const hasAlerts =
    alerts.pendingAppointments > 0 ||
    alerts.failedPayments > 0 ||
    alerts.unreadContactMessages > 0 ||
    alerts.pendingBlogComments > 0 ||
    alerts.lowStockProducts.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uyarılar</CardTitle>
        <CardDescription>İşlem bekleyen kayıtlar</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!hasAlerts ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            İşlem bekleyen kayıt bulunmuyor.
          </p>
        ) : (
          <>
            {Object.entries(ALERT_LINKS).map(([key, config]) =>
              alerts[key] > 0 ? (
                <Link
                  className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3.5 py-2.5 text-sm transition-colors hover:bg-blush-surface/60"
                  href={config.href}
                  key={key}
                >
                  <span className="flex items-center gap-2 text-primary">
                    <CircleAlert className="size-4 text-accent-gold" />
                    {config.label}
                  </span>
                  <span className="rounded-full bg-primary-container px-2.5 py-0.5 text-xs font-semibold text-on-primary">
                    {alerts[key]}
                  </span>
                </Link>
              ) : null
            )}
            {alerts.lowStockProducts.length > 0 && (
              <div className="rounded-lg bg-surface-container-low px-3.5 py-2.5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-primary">
                    <CircleAlert className="size-4 text-destructive" />
                    Düşük stoklu ürünler
                  </span>
                  <Link
                    className="text-xs font-semibold text-primary-container hover:text-burgundy-light"
                    href="/dashboard/admin/urunler"
                  >
                    Ürünlere git
                  </Link>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {alerts.lowStockProducts.map((product) => (
                    <li
                      className="flex items-center justify-between gap-3 text-sm"
                      key={product.id}
                    >
                      <span className="min-w-0 truncate text-on-surface">
                        {product.title}
                      </span>
                      <span className="shrink-0 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                        Stok: {product.stock}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TopListCard({ title, description, columns, rows }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Henüz satış verisi bulunmuyor.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border-delicate">
            {rows.map((row, index) => (
              <li
                className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
                key={`${row.id}-${row.title}`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blush-surface text-xs font-semibold text-primary-container">
                    {index + 1}
                  </span>
                  <span className="min-w-0 truncate font-medium text-primary">
                    {row.title}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-4">
                  <span className="text-muted-foreground">
                    {row.salesCount} {columns}
                  </span>
                  <span className="w-24 text-right font-semibold text-primary-container">
                    {formatPrice(row.revenue) ?? "—"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function TopSellersSection({ data }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TopListCard
        columns="satış"
        description="Ödenmiş siparişlere göre ilk 5"
        rows={data.topProducts}
        title="En Çok Satılan Ürünler"
      />
      <TopListCard
        columns="satış"
        description="Ödenmiş siparişlere göre ilk 5"
        rows={data.topCourses}
        title="En Çok Satılan Eğitimler"
      />
      <TopListCard
        columns="randevu"
        description="Onaylanan ve tamamlanan randevulara göre ilk 5"
        rows={data.topServices}
        title="En Çok Alınan Hizmetler"
      />
      <TopListCard
        columns="satış"
        description="Ödenmiş siparişlere göre ilk 5"
        rows={data.topPackages}
        title="En Çok Satılan Paketler"
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="h-28 animate-pulse rounded-xl bg-surface-container-low"
            key={index}
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-surface-container-low" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-xl bg-surface-container-low" />
        <div className="h-56 animate-pulse rounded-xl bg-surface-container-low" />
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const query = useAdminDashboardQuery();

  if (query.isPending) {
    return (
      <div className="w-full flex-1 px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Yönetici Panosu
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Mağaza, randevu ve satış özeti
            </p>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="w-full flex-1 px-4 py-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-16 text-center">
          <CircleAlert className="size-7 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {query.error?.message ?? "Panel verileri yüklenemedi"}
          </p>
          <Button onClick={() => query.refetch()} variant="outline">
            <RefreshCw className="size-4" />
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  const data = query.data;

  return (
    <div className="w-full flex-1 px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Yönetici Panosu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mağaza, randevu ve satış özeti
          </p>
        </div>
        <Button
          disabled={query.isFetching}
          onClick={() => query.refetch()}
          variant="outline"
        >
          {query.isFetching ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Yenile
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6">
        <KpiSection stats={data.stats} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RevenueChart revenue={data.revenue} />
          </div>
          <div className="lg:col-span-2">
            <AlertsCard alerts={data.alerts} />
          </div>
        </div>
        <TodayAppointmentsCard appointments={data.appointments} />
        <TopSellersSection data={data} />
        <RecentOrdersCard orders={data.recentOrders} />
        <NewCustomersCard customers={data.newCustomers} />
      </div>
    </div>
  );
}
