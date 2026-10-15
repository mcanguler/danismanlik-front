"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CircleAlert,
  LoaderCircle,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
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
import { isApiError } from "@/lib/query-errors";
import { cn } from "@/lib/utils";
import {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_AUDIENCE_LABELS,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_LABELS,
  useAdminNotificationTemplatesQuery,
} from "@/lib/notification-templates";

export const NOTIFICATION_TEMPLATES_PATH = "/dashboard/admin/bildirim-sablonlari";

const SELECT_CLASS_NAME =
  "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

const AUDIENCE_BADGE_CLASSES = {
  [NOTIFICATION_AUDIENCES.CUSTOMER]:
    "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  [NOTIFICATION_AUDIENCES.CONSULTANT]:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  [NOTIFICATION_AUDIENCES.ADMIN]:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function Badge({ className, children }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

function AudienceBadge({ template }) {
  return (
    <Badge
      className={
        AUDIENCE_BADGE_CLASSES[template.audience] ??
        "bg-muted text-muted-foreground"
      }
    >
      {template.audienceLabel || NOTIFICATION_AUDIENCE_LABELS[template.audience]}
    </Badge>
  );
}

function ChannelBadge({ channel }) {
  return (
    <Badge
      className={
        channel === NOTIFICATION_CHANNELS.SMS
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
      }
    >
      {NOTIFICATION_CHANNEL_LABELS[channel] ?? channel}
    </Badge>
  );
}

function CustomizedBadge({ template }) {
  return (
    <Badge
      className={
        template.isCustomized
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "bg-muted text-muted-foreground"
      }
    >
      {template.isCustomized ? "Özelleştirildi" : "Varsayılan"}
    </Badge>
  );
}

function useNotificationFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const audience = searchParams.get("audience") ?? "";
  const channel = searchParams.get("channel") ?? "";
  const search = searchParams.get("search") ?? "";

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return { audience, channel, search, setParam };
}

export function NotificationTemplatesManager() {
  const router = useRouter();
  const { audience, channel, search, setParam } = useNotificationFilters();
  const [searchInput, setSearchInput] = useState(search);
  const searchTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    },
    []
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setParam("search", value), 300);
  };

  const clearFilters = () => {
    setSearchInput("");
    router.replace(NOTIFICATION_TEMPLATES_PATH);
  };

  const query = useAdminNotificationTemplatesQuery({ audience, channel, search });
  const templates = query.data ?? [];
  const forbidden = isApiError(query.error) && query.error.status === 403;

  const hasFilters = Boolean(audience || channel || search);

  return (
    <div className="w-full flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Bildirim Şablonları
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {query.isSuccess
              ? `${templates.length} bildirim tipi`
              : "SMS ve e-posta şablonlarını yönetin"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_12rem_12rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Bildirim ara"
            className="h-10 pl-9"
            onChange={handleSearchChange}
            placeholder="Bildirim adı veya tip ara"
            type="search"
            value={searchInput}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="sr-only" htmlFor="audience-filter">
            Hedef kitle
          </label>
          <select
            className={SELECT_CLASS_NAME}
            id="audience-filter"
            onChange={(event) => setParam("audience", event.target.value)}
            value={audience}
          >
            <option value="">Tüm hedef kitleler</option>
            {Object.entries(NOTIFICATION_AUDIENCE_LABELS).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="sr-only" htmlFor="channel-filter">
            Kanal
          </label>
          <select
            className={SELECT_CLASS_NAME}
            id="channel-filter"
            onChange={(event) => setParam("channel", event.target.value)}
            value={channel}
          >
            <option value="">Tüm kanallar</option>
            {Object.entries(NOTIFICATION_CHANNEL_LABELS).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="mt-4">
        {query.isPending && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {query.isError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
            {forbidden ? (
              <ShieldAlert className="size-6 text-destructive" />
            ) : (
              <CircleAlert className="size-6 text-destructive" />
            )}
            <p className="text-sm text-muted-foreground">
              {forbidden
                ? "Bu alan için yetkiniz yok."
                : "Bildirim şablonları yüklenemedi."}
            </p>
            {!forbidden && (
              <Button variant="outline" onClick={() => query.refetch()}>
                Tekrar Dene
              </Button>
            )}
          </div>
        )}

        {query.isSuccess && templates.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <SlidersHorizontal className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Sonuç bulunamadı</p>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Filtreleri değiştirerek tekrar deneyin"
                : "Tanımlı bildirim tipi yok"}
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Filtreleri temizle
              </Button>
            )}
          </div>
        )}

        {query.isSuccess && templates.length > 0 && (
          <>
            <div className="hidden overflow-x-auto rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Bildirim</TableHead>
                    <TableHead>Hedef Kitle</TableHead>
                    <TableHead>Kanallar</TableHead>
                    <TableHead className="pr-4">Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow
                      className="cursor-pointer"
                      key={template.type}
                      onClick={() =>
                        router.push(`${NOTIFICATION_TEMPLATES_PATH}/${template.type}`)
                      }
                    >
                      <TableCell className="pl-4">
                        <p className="font-medium">{template.label}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {template.type}
                        </p>
                      </TableCell>
                      <TableCell>
                        <AudienceBadge template={template} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {template.channels.map((channel) => (
                            <ChannelBadge channel={channel} key={channel} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="pr-4">
                        <CustomizedBadge template={template} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {templates.map((template) => (
                <button
                  className="rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/30"
                  key={template.type}
                  onClick={() =>
                    router.push(`${NOTIFICATION_TEMPLATES_PATH}/${template.type}`)
                  }
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{template.label}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        {template.type}
                      </p>
                    </div>
                    <CustomizedBadge template={template} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <AudienceBadge template={template} />
                    {template.channels.map((channel) => (
                      <ChannelBadge channel={channel} key={channel} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
