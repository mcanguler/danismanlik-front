"use client";

import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  CalendarDays,
  CalendarPlus,
  CreditCard,
  Clock,
  Package,
  Store,
} from "lucide-react";
import { RequireRole } from "@/components/require-role";
import { useAuth } from "@/lib/auth-hooks";
import { useMyServicePackagesQuery } from "@/lib/service-packages";
import { packageIsUsable } from "@/lib/service-packages";

const QUICK_LINKS = [
  {
    title: "Profil ve Fatura Bilgileri",
    description: "Profilinizi ve fatura bilgilerinizi güncelleyin",
    href: "/dashboard/customer/profil",
    icon: CreditCard,
  },
  {
    title: "Randevular & Takvim",
    description: "Yaklaşan ve geçmiş randevularınızı görüntüleyin",
    href: "/appointments",
    icon: CalendarDays,
  },
  {
    title: "Seans Paketlerim",
    description: "Satın aldığınız paketleri ve kullanımları takip edin",
    href: "/dashboard/customer/paketlerim",
    icon: Package,
  },

];

export default function CustomerDashboardPage() {
  return (
    <RequireRole role="CUSTOMER">
      <CustomerHome />
    </RequireRole>
  );
}

function CustomerHome() {
  const { user } = useAuth();
  const packagesQuery = useMyServicePackagesQuery();
  const purchases = packagesQuery.data ?? [];
  const activePurchase = purchases.find((purchase) => packageIsUsable(purchase));
  const remaining = activePurchase?.remainingQuantity ?? 0;
  const packageName = activePurchase?.package?.name ?? null;
  const expiresAt = activePurchase?.expiresAt
    ? format(new Date(activePurchase.expiresAt), "d MMMM yyyy", { locale: tr })
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8">
      {/* Hero Header */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-low p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 size-80 rounded-full bg-secondary-container/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-40 size-64 rounded-full bg-tertiary-fixed/15 blur-2xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-widest text-secondary">
                Danışan Portalı
              </span>
            </div>
            <h1 className="mt-1 font-headline-lg text-headline-lg tracking-tight text-primary">
              Hoş Geldiniz,{" "}
              <span className="font-serif italic font-normal">
                {user?.first_name ?? user?.name ?? "Danışan"}
              </span>
            </h1>
            <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Profilinizi ve randevularınızı yönetmek için aşağıdaki bağlantıları kullanabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <Link
            className="group flex flex-col justify-between gap-4 rounded-2xl bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md"
            href={link.href}
            key={link.href}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-title-md text-title-md text-primary">
                  {link.title}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {link.description}
                </p>
              </div>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blush-surface text-primary transition-transform group-hover:scale-110">
                <link.icon className="size-6" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
