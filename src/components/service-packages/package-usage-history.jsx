"use client";

import {
  CircleCheck,
  CircleAlert,
  History,
  RefreshCcw,
} from "lucide-react";
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
  USAGE_STATUS_BADGE_CLASSES,
  USAGE_STATUS_LABELS,
  USAGE_STATUSES,
} from "@/lib/service-packages";
import { formatDateTimeTr } from "@/lib/format";

function UsageStatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        USAGE_STATUS_BADGE_CLASSES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status === USAGE_STATUSES.USED ? (
        <CircleCheck className="size-3" />
      ) : (
        <RefreshCcw className="size-3" />
      )}
      {USAGE_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function UsageHistorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          className="h-9 rounded-lg bg-muted animate-pulse"
          key={index}
        />
      ))}
    </div>
  );
}

export function PackageUsageHistory({ purchase, isLoading }) {
  const usages = purchase?.usages ?? [];

  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <History className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Kullanım Geçmişi</h2>
        <span className="text-xs text-muted-foreground">
          ({usages.length})
        </span>
      </div>

      {isLoading ? (
        <UsageHistorySkeleton />
      ) : usages.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center">
          <CircleAlert className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Bu paket için henüz bir kullanım kaydı yok
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Hizmet</TableHead>
                  <TableHead>Randevu</TableHead>
                  <TableHead>Kullanım Miktarı</TableHead>
                  <TableHead>Kullanım Tarihi</TableHead>
                  <TableHead className="pr-4">Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usages.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell className="pl-4 font-medium">
                      {usage.service?.name ?? `Hizmet #${usage.service_id ?? "?"}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {usage.appointment_id
                        ? `Randevu #${usage.appointment_id}`
                        : "—"}
                    </TableCell>
                    <TableCell>{usage.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTimeTr(usage.usedAt) ?? "—"}
                    </TableCell>
                    <TableCell className="pr-4">
                      <UsageStatusBadge status={usage.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {usages.map((usage) => (
              <div className="rounded-xl border bg-card p-4" key={usage.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 font-medium">
                    {usage.service?.name ?? `Hizmet #${usage.service_id ?? "?"}`}
                  </p>
                  <UsageStatusBadge status={usage.status} />
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex flex-col">
                    <dt>Randevu</dt>
                    <dd className="text-foreground">
                      {usage.appointment_id ? `#${usage.appointment_id}` : "—"}
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt>Kullanım Miktarı</dt>
                    <dd className="text-foreground">{usage.quantity}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt>Kullanım Tarihi</dt>
                    <dd className="text-foreground">
                      {formatDateTimeTr(usage.usedAt) ?? "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
