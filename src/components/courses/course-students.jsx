"use client";

import { useMemo, useState } from "react";
import {
  CircleAlert,
  GraduationCap,
  LoaderCircle,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { formatDateTr } from "@/lib/format";
import {
  COURSE_ACCESS_SOURCE_BADGE_CLASSES,
  useCourseUsersQuery,
  useGrantCourseAccess,
  useRevokeCourseAccess,
} from "@/lib/courses";
import { useCustomersQuery } from "@/lib/customers";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function SourceBadge({ source }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        COURSE_ACCESS_SOURCE_BADGE_CLASSES[source] ?? "bg-muted text-muted-foreground"
      )}
    >
      {source === "PURCHASE" ? "Satın Alma" : "Yönetici"}
    </span>
  );
}

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

export function CourseStudents({ courseId }) {
  const [grantOpen, setGrantOpen] = useState(false);
  const [revoking, setRevoking] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const accessQuery = useCourseUsersQuery(courseId);
  const customersQuery = useCustomersQuery();
  const grant = useGrantCourseAccess(courseId);
  const revoke = useRevokeCourseAccess(courseId);

  const accesses = useMemo(() => accessQuery.data ?? [], [accessQuery.data]);
  const customers = useMemo(
    () => customersQuery.data ?? [],
    [customersQuery.data]
  );

  const availableCustomers = useMemo(() => {
    const assignedIds = new Set(accesses.map((access) => access.user_id));
    return customers.filter((customer) => !assignedIds.has(customer.id));
  }, [accesses, customers]);

  const handleGrant = (event) => {
    event.preventDefault();
    if (!customerId) return;
    const payload = {
      user_id: Number(customerId),
      ...(expiresAt ? { expires_at: expiresAt } : {}),
    };
    grant.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Kurs erişimi verildi", type: "success" });
        setGrantOpen(false);
        setCustomerId("");
        setExpiresAt("");
      },
      onError: (error) => {
        toast.add({
          title: "Erişim verilemedi",
          description: getErrorMessage(error),
          type: "error",
        });
      },
    });
  };

  const handleRevoke = () => {
    if (!revoking) return;
    revoke.mutate(revoking.user_id, {
      onSuccess: () => {
        toast.add({ title: "Erişim kaldırıldı", type: "success" });
        setRevoking(null);
      },
      onError: (error) => {
        toast.add({
          title: "Erişim kaldırılamadı",
          description: getErrorMessage(error),
          type: "error",
        });
        setRevoking(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        className="h-9 self-start"
        onClick={() => setGrantOpen(true)}
      >
        <UserPlus className="size-4" />
        Erişim Ver
      </Button>

      {accessQuery.isPending && (
        <div className="flex justify-center py-10">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {accessQuery.isError && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
          <CircleAlert className="size-6 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(accessQuery.error)}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => accessQuery.refetch()}
          >
            Tekrar Dene
          </Button>
        </div>
      )}

      {accessQuery.isSuccess && accesses.length === 0 && (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-10 text-center">
          <Users className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">Henüz erişimi olan öğrenci yok</p>
          <p className="text-sm text-muted-foreground">
            Müşteri seçerek kursa erişim verebilirsiniz
          </p>
        </div>
      )}

      {accessQuery.isSuccess && accesses.length > 0 && (
        <div className="flex flex-col gap-2">
          {accesses.map((access) => (
            <div
              key={access.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border bg-background px-3 py-2.5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <GraduationCap className="size-4 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {access.user?.name ?? `Kullanıcı #${access.user_id}`}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {access.user?.email ?? "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    COURSE_ACCESS_SOURCE_BADGE_CLASSES[access.source] ??
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {access.source === "PURCHASE" ? "Satın Alma" : "Yönetici"}
                </span>
                {access.expires_at && (
                  <span className="text-xs text-muted-foreground">
                    Bitiş: {formatDateTr(access.expires_at)}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setRevoking(access)}
                  aria-label="Erişimi kaldır"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kursa Erişim Ver</DialogTitle>
            <DialogDescription>
              Sadece müşteri (CUSTOMER) kullanıcıları listelenir
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" noValidate onSubmit={handleGrant}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grant_customer">Müşteri</Label>
              {customersQuery.isPending ? (
                <div className="flex h-8 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Müşteriler yükleniyor...
                </div>
              ) : (
                <select
                  className={selectClassName}
                  disabled={availableCustomers.length === 0}
                  id="grant_customer"
                  onChange={(event) => setCustomerId(event.target.value)}
                  value={customerId}
                >
                  <option value="">Müşteri seçin</option>
                  {availableCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              )}
              {!customersQuery.isPending &&
                customers.length > 0 &&
                availableCustomers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Tüm müşterilerin bu kursa zaten erişimi var
                  </p>
                )}
              {!customersQuery.isPending && customers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Sistemde müşteri bulunmuyor
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grant_expires_at">Bitiş Tarihi (opsiyonel)</Label>
              <Input
                id="grant_expires_at"
                onChange={(event) => setExpiresAt(event.target.value)}
                type="date"
                value={expiresAt}
              />
              <p className="text-xs text-muted-foreground">
                Belirtilmezse erişim süresiz olur
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => setGrantOpen(false)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="h-10"
                disabled={grant.isPending || !customerId}
              >
                {grant.isPending && (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
                {grant.isPending ? "Atanıyor..." : "Erişim Ver"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(revoking)}
        onOpenChange={(open) => {
          if (!open) setRevoking(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erişimi kaldır</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{revoking?.user?.name ?? ""}&quot; kullanıcısının bu kurusa
              erişimi kaldırılacak. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-10"
              onClick={handleRevoke}
              disabled={revoke.isPending}
            >
              {revoke.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {revoke.isPending ? "Kaldırılıyor..." : "Erişimi Kaldır"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
