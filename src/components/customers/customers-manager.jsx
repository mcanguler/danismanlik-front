"use client";

import { useState } from "react";
import {
  CircleAlert,
  Eye,
  LoaderCircle,
  Mail,
  Pencil,
  Phone as PhoneIcon,
  Plus,
  Trash2,
  Users,
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
import {
  useCustomerQuery,
  useCustomersQuery,
  useDeleteCustomer,
} from "@/lib/customers";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { CustomerDetailDialog } from "@/components/customers/customer-detail-dialog";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function CustomersManager() {
  const [view, setView] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteCustomer();

  const customerId = view?.mode && view.mode !== "create" ? view.id : null;
  const detailQuery = useCustomerQuery(customerId);

  const query = useCustomersQuery();
  const customers = query.data ?? [];

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Müşteri silindi", type: "success" });
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
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Müşteriler</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {customers.length} müşteri
          </p>
        </div>
        <Button
          size="lg"
          className="h-10"
          onClick={() => setView({ mode: "create" })}
        >
          <Plus className="size-4" />
          Yeni Müşteri
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

        {query.isSuccess && customers.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz müşteri yok</p>
            <p className="text-sm text-muted-foreground">
              İlk müşteriyi ekleyerek başlayın
            </p>
            <Button variant="outline" onClick={() => setView({ mode: "create" })}>
              <Plus className="size-4" />
              Yeni Müşteri
            </Button>
          </div>
        )}

        {query.isSuccess && customers.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Müşteri</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.phone || "—"}
                      </TableCell>
                      <TableCell className="max-w-[10rem] truncate text-muted-foreground">
                        {item.email || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                          {item.addressesCount}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setView({ mode: "detail", id: item.id })
                            }
                            aria-label={`${item.name} detayı`}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setView({ mode: "edit", id: item.id })
                            }
                            aria-label={`${item.name} düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(item)}
                            aria-label={`${item.name} sil`}
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
              {customers.map((item) => (
                <div key={item.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                        <PhoneIcon className="size-3.5 shrink-0" />
                        {item.phone || "—"}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                        <Mail className="size-3.5 shrink-0" />
                        {item.email || "—"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                      {item.addressesCount} adres
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1"
                      onClick={() => setView({ mode: "detail", id: item.id })}
                    >
                      <Eye className="size-3.5" />
                      Detay
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1"
                      onClick={() => setView({ mode: "edit", id: item.id })}
                    >
                      <Pencil className="size-3.5" />
                      Düzenle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1 text-destructive hover:text-destructive"
                      onClick={() => setDeleting(item)}
                    >
                      <Trash2 className="size-3.5" />
                      Sil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <CustomerFormDialog
        key={view ? (view.id ?? "new") : "closed"}
        open={Boolean(view && (view.mode === "create" || view.mode === "edit"))}
        mode={view?.mode === "edit" ? "edit" : "create"}
        customer={view?.mode === "edit" ? (detailQuery.data ?? null) : null}
        loading={view?.mode === "edit" && detailQuery.isPending}
        error={view?.mode === "edit" ? detailQuery.error : null}
        onRetry={() => detailQuery.refetch()}
        onOpenChange={(open) => {
          if (!open) setView(null);
        }}
      />

      <CustomerDetailDialog
        open={Boolean(view?.mode === "detail")}
        customer={view?.mode === "detail" ? (detailQuery.data ?? null) : null}
        loading={view?.mode === "detail" && detailQuery.isPending}
        error={view?.mode === "detail" ? detailQuery.error : null}
        onRetry={() => detailQuery.refetch()}
        onOpenChange={(open) => {
          if (!open) setView(null);
        }}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteriyi sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.name ?? ""}&quot; silinecek. Bu işlem geri
              alınamaz.
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