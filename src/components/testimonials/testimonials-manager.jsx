"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  CircleCheck,
  Clock,
  Eye,
  LoaderCircle,
  MessageSquareQuote,
  Plus,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  useDeleteTestimonial,
  useTestimonialApproval,
  useTestimonialQuery,
  useTestimonialsQuery,
} from "@/lib/testimonials";

const APPROVAL_FILTER_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "0", label: "Onay Bekleyenler" },
  { value: "1", label: "Onaylananlar" },
];

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function ApprovalBadge({ isApproved }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isApproved
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      )}
    >
      {isApproved ? (
        <CircleCheck className="size-3" />
      ) : (
        <Clock className="size-3" />
      )}
      {isApproved ? "Onaylı" : "Onay Bekliyor"}
    </span>
  );
}

function PendingDot() {
  return (
    <span
      aria-label="Onay bekliyor"
      className="size-1.5 shrink-0 rounded-full bg-amber-500"
    />
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

export function TestimonialsManager() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [approvalFilter, setApprovalFilter] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const query = useTestimonialsQuery({
    page,
    ...(approvalFilter !== "" ? { is_approved: approvalFilter } : {}),
  });
  const testimonials = useMemo(() => query.data?.items ?? [], [query.data]);
  const meta = query.data?.meta;

  const approvalMutation = useTestimonialApproval();
  const deleteMutation = useDeleteTestimonial();

  const detailQuery = useTestimonialQuery(detailId);
  const detail = detailQuery.data;

  const pendingCount = useMemo(() => {
    if (approvalFilter === "0") return meta?.total ?? 0;
    if (approvalFilter === "1") return 0;
    return testimonials.filter((item) => !item.is_approved).length;
  }, [testimonials, approvalFilter, meta]);

  const setApproval = (testimonial, isApproved) => {
    approvalMutation.mutate(
      { id: testimonial.id, isApproved },
      {
        onSuccess: () => {
          toast.add({
            title: isApproved ? "Yorum onaylandı" : "Yorumun onayı kaldırıldı",
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
        toast.add({ title: "Yorum silindi", type: "success" });
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

  const renderActions = (item, { withLabels = false } = {}) => (
    <div
      className={cn(
        "items-center gap-1",
        withLabels ? "flex" : "flex justify-end"
      )}
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        aria-label={`${item.name} detay`}
        onClick={() => setDetailId(item.id)}
        size={withLabels ? "sm" : "icon-sm"}
        type="button"
        variant="ghost"
      >
        <Eye className="size-4" />
        {withLabels && "Detay"}
      </Button>
      <Button
        aria-label={item.is_approved ? `${item.name} onayı kaldır` : `${item.name} onayla`}
        disabled={approvalMutation.isPending}
        onClick={() => setApproval(item, !item.is_approved)}
        size={withLabels ? "sm" : "icon-sm"}
        type="button"
        variant="ghost"
      >
        {item.is_approved ? (
          <>
            <Undo2 className="size-4" />
            {withLabels && "Onayı Kaldır"}
          </>
        ) : (
          <>
            <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            {withLabels && "Onayla"}
          </>
        )}
      </Button>
      <Button
        aria-label={`${item.name} sil`}
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleting(item)}
        size={withLabels ? "sm" : "icon-sm"}
        type="button"
        variant="ghost"
      >
        <Trash2 className="size-4" />
        {withLabels && "Sil"}
      </Button>
    </div>
  );

  return (
    <div className="w-full flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Danışan Yorumları
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {meta ? `${meta.total} yorum` : "Danışan yorumları"}
            {pendingCount > 0 ? ` · ${pendingCount} onay bekliyor` : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/admin/yorumlar/yeni")} type="button">
          <Plus className="size-4" />
          Yorum Ekle
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          aria-label="Onay durumu filtresi"
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          onChange={(event) => {
            setApprovalFilter(event.target.value);
            setPage(1);
          }}
          value={approvalFilter}
        >
          {APPROVAL_FILTER_OPTIONS.map((option) => (
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

        {query.isSuccess && testimonials.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <MessageSquareQuote className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Henüz danışan yorumu bulunmuyor.
            </p>
            <p className="text-sm text-muted-foreground">
              {approvalFilter !== ""
                ? "Filtreleri değiştirerek tekrar arayabilirsiniz"
                : "Danışanların gönderdiği yorumlar burada listelenir"}
            </p>
          </div>
        )}

        {query.isSuccess && testimonials.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Ad</TableHead>
                    <TableHead>Soyad</TableHead>
                    <TableHead>Görüş</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((item) => (
                    <TableRow
                      className={cn(
                        "cursor-pointer",
                        !item.is_approved && "bg-amber-500/[0.04] font-medium"
                      )}
                      key={item.id}
                      onClick={() => setDetailId(item.id)}
                    >
                      <TableCell className="pl-4">
                        <span className="flex items-center gap-1.5">
                          {!item.is_approved && <PendingDot />}
                          {item.first_name || item.name || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.last_name ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-64 truncate text-muted-foreground">
                        {excerpt(item.message)}
                      </TableCell>
                      <TableCell>
                        <ApprovalBadge isApproved={item.is_approved} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTimeTr(item.created_at)}
                      </TableCell>
                      <TableCell className="pr-4">
                        {renderActions(item)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {testimonials.map((item) => (
                <div
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30",
                    !item.is_approved && "border-l-4 border-l-amber-500"
                  )}
                  key={item.id}
                >
                  <button
                    className="flex flex-col gap-2 text-left"
                    onClick={() => setDetailId(item.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {[item.first_name, item.last_name]
                            .filter(Boolean)
                            .join(" ") || item.name || "—"}
                        </p>
                      </div>
                      <ApprovalBadge isApproved={item.is_approved} />
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {excerpt(item.message, 110)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTimeTr(item.created_at)}
                    </span>
                  </button>
                  <div className="border-t pt-2">
                    {renderActions(item, { withLabels: true })}
                  </div>
                </div>
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
                  {[detail.first_name, detail.last_name]
                    .filter(Boolean)
                    .join(" ") || detail.name}
                  <ApprovalBadge isApproved={detail.is_approved} />
                </DialogTitle>
                <DialogDescription>
                  {formatDateTimeTr(detail.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-5">
                <DetailSection>
                  <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-4">
                    <DetailRow
                      label="Ad"
                      value={detail.first_name ?? detail.name ?? "—"}
                    />
                    <DetailRow label="Soyad" value={detail.last_name ?? "—"} />
                    <DetailRow
                      label="Oluşturulma Tarihi"
                      value={formatDateTimeTr(detail.created_at)}
                    />
                    <DetailRow
                      label="Güncellenme Tarihi"
                      value={formatDateTimeTr(detail.updated_at)}
                    />
                  </div>
                </DetailSection>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Görüş
                  </Label>
                  <p className="whitespace-pre-line rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed">
                    {detail.message}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    disabled={approvalMutation.isPending}
                    onClick={() => setApproval(detail, !detail.is_approved)}
                    type="button"
                    variant="outline"
                  >
                    {approvalMutation.isPending && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}
                    {detail.is_approved ? "Onayı Kaldır" : "Onayla"}
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
            <AlertDialogTitle>Yorumu sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.name ?? ""}&quot; tarafından gönderilen yorum
              kalıcı olarak silinecek. Bu işlem geri alınamaz.
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
