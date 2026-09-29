"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  LoaderCircle,
  Pencil,
  Plus,
  Ticket,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { formatPrice } from "@/lib/format";
import {
  COUPON_TYPE_LABELS,
  useAdminCouponsQuery,
  useDeleteCoupon,
} from "@/lib/coupons";

const LIST_PATH = "/dashboard/admin/kuponlar";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function couponValueLabel(coupon) {
  if (coupon.type === "PERCENTAGE") return `%${Number(coupon.value)}`;
  return formatPrice(coupon.value) ?? "—";
}

function couponUsageLabel(coupon) {
  const limit =
    coupon.usageLimit !== null && coupon.usageLimit !== undefined
      ? ` / ${coupon.usageLimit}`
      : "";
  return `${coupon.usageCount}${limit}`;
}

export function CouponsManager() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteCoupon();

  const query = useAdminCouponsQuery();
  const coupons = query.data ?? [];

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Kupon silindi", type: "success" });
        setDeleting(null);
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
    <div className="w-full flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Kuponlar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {coupons.length} kupon
          </p>
        </div>
        <Button
          size="lg"
          className="h-10"
          onClick={() => router.push(`${LIST_PATH}/yeni`)}
        >
          <Plus className="size-4" />
          Yeni Kupon
        </Button>
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
              {getErrorMessage(query.error)}
            </p>
            <Button variant="outline" onClick={() => query.refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && coupons.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <Ticket className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz kupon yok</p>
            <p className="text-sm text-muted-foreground">
              İlk kuponu ekleyerek başlayın
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`${LIST_PATH}/yeni`)}
            >
              <Plus className="size-4" />
              Yeni Kupon
            </Button>
          </div>
        )}

        {query.isSuccess && coupons.length > 0 && (
          <>
            <div className="hidden overflow-x-auto rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Kod</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>İndirim</TableHead>
                    <TableHead>Kullanım</TableHead>
                    <TableHead>Min. Sepet</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="pl-4 font-medium">
                        {coupon.code}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {COUPON_TYPE_LABELS[coupon.type] ?? coupon.type}
                      </TableCell>
                      <TableCell className="font-medium">
                        {couponValueLabel(coupon)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {couponUsageLabel(coupon)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatPrice(coupon.minimumAmount) ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={coupon.isActive} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => router.push(`${LIST_PATH}/${coupon.id}`)}
                            aria-label={`${coupon.code} düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(coupon)}
                            aria-label={`${coupon.code} sil`}
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
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Ticket className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{coupon.code}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {COUPON_TYPE_LABELS[coupon.type] ?? coupon.type} ·{" "}
                        {couponValueLabel(coupon)}
                      </p>
                    </div>
                    <StatusBadge active={coupon.isActive} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Kullanım: {couponUsageLabel(coupon)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9"
                        onClick={() => router.push(`${LIST_PATH}/${coupon.id}`)}
                      >
                        <Pencil className="size-3.5" />
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 text-destructive hover:text-destructive"
                        onClick={() => setDeleting(coupon)}
                      >
                        <Trash2 className="size-3.5" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kuponu sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.code ?? ""}&quot; kuponu silinecek. Bu işlem
              geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-10"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
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
