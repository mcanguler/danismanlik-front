"use client";

import { useState } from "react";
import { CircleAlert, LoaderCircle, Pencil, Plus, Trash2, Users } from "lucide-react";
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
import {
  useConsultantQuery,
  useConsultantsQuery,
  useDeleteConsultant,
} from "@/lib/consultants";
import { ConsultantFormDialog } from "@/components/consultants/consultant-form-dialog";

const FILTERS = [
  { label: "Tümü", value: "all" },
  { label: "Aktif", value: "1" },
  { label: "Pasif", value: "0" },
];

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function ConsultantsManager() {
  const [filter, setFilter] = useState("all");
  const [dialogState, setDialogState] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteConsultant();

  const editingId = dialogState?.id ?? null;
  const detailQuery = useConsultantQuery(editingId);

  const query = useConsultantsQuery(filter === "all" ? {} : { is_active: filter });
  const consultants = query.data ?? [];

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Danışman silindi", type: "success" });
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
          <h1 className="text-xl font-semibold tracking-tight">Danışmanlar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {consultants.length} danışman
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setDialogState({ id: null })}
          className="h-10"
        >
          <Plus className="size-4" />
          Yeni Danışman
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {FILTERS.map(({ label, value }) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
          >
            {label}
          </Button>
        ))}
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

        {query.isSuccess && consultants.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {filter === "all"
                ? "Henüz danışman yok"
                : "Filtreye uygun danışman bulunamadı"}
            </p>
            {filter === "all" && (
              <p className="text-sm text-muted-foreground">
                İlk danışmanı ekleyerek başlayın
              </p>
            )}
            <Button
              variant="outline"
              onClick={() => setDialogState({ id: null })}
            >
              <Plus className="size-4" />
              Yeni Danışman
            </Button>
          </div>
        )}

        {query.isSuccess && consultants.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Danışman</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultants.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.title || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.slug || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={item.is_active} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setDialogState({ id: item.id })
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
              {consultants.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {item.title || "—"}
                      </p>
                    </div>
                    <StatusBadge active={item.is_active} />
                  </div>
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    {item.slug ? `/${item.slug}` : "—"}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1"
                      onClick={() => setDialogState({ id: item.id })}
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

      <ConsultantFormDialog
        key={dialogState ? (dialogState.id ?? "new") : "closed"}
        open={Boolean(dialogState)}
        mode={dialogState?.id ? "edit" : "create"}
        consultant={dialogState?.id ? (detailQuery.data ?? null) : null}
        loading={Boolean(dialogState?.id) && detailQuery.isPending}
        error={dialogState?.id ? detailQuery.error : null}
        onRetry={() => detailQuery.refetch()}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
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
            <AlertDialogTitle>Danışmanı sil</AlertDialogTitle>
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