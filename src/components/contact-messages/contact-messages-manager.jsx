"use client";

import { useMemo, useState } from "react";
import {
  CircleAlert,
  Eye,
  LoaderCircle,
  Mail,
  MailOpen,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { formatDateTimeTr } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import {
  useContactMessageQuery,
  useContactMessagesQuery,
  useDeleteContactMessage,
  useMarkContactMessageRead,
} from "@/lib/contact-messages";

const READ_FILTER_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "0", label: "Okunmamış" },
  { value: "1", label: "Okunmuş" },
];

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function ReadBadge({ isRead }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isRead
          ? "bg-muted text-muted-foreground"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      )}
    >
      {isRead ? (
        <MailOpen className="size-3" />
      ) : (
        <Mail className="size-3" />
      )}
      {isRead ? "Okunmuş" : "Okunmamış"}
    </span>
  );
}

function excerpt(text, maxLength = 80) {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  if (value.length <= maxLength) return value || "—";
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function DetailSection({ children }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right text-sm font-medium",
          mono && "font-mono text-xs"
        )}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

export function ContactMessagesManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const query = useContactMessagesQuery({
    page,
    ...(search ? { search } : {}),
    ...(readFilter !== "" ? { is_read: readFilter } : {}),
  });
  const messages = useMemo(() => query.data?.items ?? [], [query.data]);
  const meta = query.data?.meta;

  const markRead = useMarkContactMessageRead();
  const deleteMutation = useDeleteContactMessage();

  const detailQuery = useContactMessageQuery(detailId);
  const detail = detailQuery.data;

  const unreadCount = useMemo(() => {
    if (readFilter === "0") return meta?.total ?? 0;
    if (readFilter === "1") return 0;
    return messages.filter((message) => !message.is_read).length;
  }, [messages, readFilter, meta]);

  const handleDetailOpen = (message) => {
    setDetailId(message.id);
    if (!message.is_read) {
      markRead.mutate({ id: message.id, isRead: true });
    }
  };

  const toggleRead = () => {
    if (!detail) return;
    markRead.mutate(
      { id: detail.id, isRead: !detail.is_read },
      {
        onSuccess: () => {
          toast.add({
            title: detail.is_read ? "Okunmadı olarak işaretlendi" : "Okundu olarak işaretlendi",
            type: "success",
          });
        },
        onError: (error) => {
          toast.add({
            title: "İşlem başarısız",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Mesaj silindi", type: "success" });
        setDeleting(null);
        if (detailId === deleting.id) setDetailId(null);
      },
      onError: (error) => {
        toast.add({
          title: "Silme başarısız",
          description: getErrorMessage(error),
          type: "error",
        });
        setDeleting(null);
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            İletişim Formları
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {meta ? `${meta.total} mesaj` : "İletişim formu mesajları"}
            {unreadCount > 0
              ? ` · ${unreadCount} okunmamış`
              : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-64 pl-8"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="İsim, e-posta veya konu ara..."
            type="text"
            value={search}
          />
        </div>
        <select
          aria-label="Okundu filtresi"
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          onChange={(event) => {
            setReadFilter(event.target.value);
            setPage(1);
          }}
          value={readFilter}
        >
          {READ_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {query.isPending && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {query.isError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
            <CircleAlert className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {getQueryErrorMessage(query.error)}
            </p>
            <Button onClick={() => query.refetch()} variant="outline">
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <Mail className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Henüz iletişim mesajı bulunmuyor.
            </p>
            <p className="text-sm text-muted-foreground">
              {search || readFilter !== ""
                ? "Filtreleri değiştirerek tekrar arayabilirsiniz"
                : "İletişim formundan gelen mesajlar burada listelenir"}
            </p>
          </div>
        )}

        {query.isSuccess && messages.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">İsim</TableHead>
                    <TableHead>E-Posta</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Konu</TableHead>
                    <TableHead>Mesaj</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow
                      className={cn(
                        "cursor-pointer",
                        !message.is_read && "bg-amber-500/[0.04] font-medium"
                      )}
                      key={message.id}
                      onClick={() => setDetailId(message.id)}
                    >
                      <TableCell className="pl-4">
                        <span className="flex items-center gap-1.5">
                          {!message.is_read && (
                            <span
                              aria-label="Okunmamış"
                              className="size-1.5 shrink-0 rounded-full bg-amber-500"
                            />
                          )}
                          {message.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {message.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {message.phone ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-40 truncate text-muted-foreground">
                        {message.subject ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-56 truncate text-muted-foreground">
                        {excerpt(message.message)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTimeTr(message.created_at)}
                      </TableCell>
                      <TableCell>
                        <ReadBadge isRead={message.is_read} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button
                            aria-label={`${message.name} detay`}
                            onClick={() => handleDetailOpen(message)}
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            aria-label={`${message.name} sil`}
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(message)}
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {messages.map((message) => (
                <button
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/30",
                    !message.is_read && "border-l-4 border-l-amber-500"
                  )}
                  key={message.id}
                  onClick={() => setDetailId(message.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {message.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {message.email}
                      </p>
                    </div>
                    <ReadBadge isRead={message.is_read} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    Konu: {message.subject ?? "—"}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {excerpt(message.message, 110)}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDateTimeTr(message.created_at)}
                    </span>
                    <div
                      className="flex items-center gap-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Button
                        aria-label={`${message.name} detay`}
                        onClick={() => handleDetailOpen(message)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        aria-label={`${message.name} sil`}
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(message)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

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
      </div>

      <Dialog
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        open={detailId != null}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          {detailQuery.isPending && (
            <div className="flex justify-center py-12">
              <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {detailQuery.isError && (
            <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
              <CircleAlert className="size-6 text-destructive" />
              <p className="text-sm text-muted-foreground">
                {getQueryErrorMessage(detailQuery.error)}
              </p>
            </div>
          )}

          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  {detail.name}
                  <ReadBadge isRead={detail.is_read} />
                </DialogTitle>
                <DialogDescription>
                  {formatDateTimeTr(detail.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-4">
                  <DetailRow label="İsim" value={detail.name} />
                  <DetailRow
                    label="E-Posta"
                    value={
                      detail.email ? (
                        <a
                          className="text-primary hover:underline"
                          href={`mailto:${detail.email}`}
                        >
                          {detail.email}
                        </a>
                      ) : null
                    }
                  />
                  <DetailRow
                    label="Telefon"
                    value={
                      detail.phone ? (
                        <a
                          className="text-primary hover:underline"
                          href={`tel:${detail.phone}`}
                        >
                          {detail.phone}
                        </a>
                      ) : null
                    }
                  />
                  <DetailRow label="Konu" value={detail.subject ?? "—"} />
                  <DetailRow
                    label="Gönderim Tarihi"
                    value={formatDateTimeTr(detail.created_at)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mesaj
                  </Label>
                  <p className="whitespace-pre-line rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed">
                    {detail.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-dashed p-4">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Teknik Bilgiler
                  </Label>
                  <DetailRow
                    label="IP Adresi"
                    mono
                    value={detail.ip_address ?? "—"}
                  />
                  <DetailRow
                    label="User Agent"
                    mono
                    value={
                      detail.user_agent ? (
                        <span className="line-clamp-2 break-all">
                          {detail.user_agent}
                        </span>
                      ) : null
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    disabled={markRead.isPending}
                    onClick={toggleRead}
                    type="button"
                    variant="outline"
                  >
                    {markRead.isPending && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}
                    {detail.is_read
                      ? "Okunmadı Olarak İşaretle"
                      : "Okundu Olarak İşaretle"}
                  </Button>
                  <Button
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(detail)}
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="size-4" />
                    Sil
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        open={Boolean(deleting)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mesajı sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.name ?? ""}&quot; tarafından gönderilen
              &quot;{deleting?.subject ?? "—"}&quot; konulu mesaj kalıcı olarak
              silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
              variant="destructive"
            >
              {deleteMutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
