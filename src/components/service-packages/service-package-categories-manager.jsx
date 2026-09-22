"use client";

import { useState } from "react";
import {
  CircleAlert,
  FolderTree,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
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
import { toast } from "@/components/ui/toast";
import {
  useDeleteServicePackageCategory,
  useServicePackageCategoriesQuery,
} from "@/lib/service-packages";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { ServicePackageCategoryFormDialog } from "@/components/service-packages/service-package-category-form-dialog";

export function ServicePackageCategoriesManager() {
  const [dialogState, setDialogState] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteServicePackageCategory();

  const query = useServicePackageCategoriesQuery();
  const categories = query.data ?? [];

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Paket kategorisi silindi", type: "success" });
        setDeleting(null);
      },
      onError: (error) => {
        toast.add({
          title: "Silme başarısız",
          description: getQueryErrorMessage(error),
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
            Paket Kategorileri
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {categories.length} kategori
          </p>
        </div>
        <Button className="h-10" onClick={() => setDialogState({ category: null })}>
          <Plus className="size-4" />
          Yeni Kategori
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
              {getQueryErrorMessage(query.error)}
            </p>
            <Button onClick={() => query.refetch()} variant="outline">
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && categories.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <FolderTree className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz paket kategorisi yok</p>
            <p className="text-sm text-muted-foreground">
              Paketleri gruplamak için ilk kategoriyi ekleyin
            </p>
            <Button
              className="mt-1"
              onClick={() => setDialogState({ category: null })}
              variant="outline"
            >
              <Plus className="size-4" />
              Yeni Kategori
            </Button>
          </div>
        )}

        {query.isSuccess && categories.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Sıra</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="pl-4 font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.slug || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={category.is_active} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.sort_order}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDialogState({ category })}
                            aria-label={`${category.name} düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(category)}
                            aria-label={`${category.name} sil`}
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
              {categories.map((category) => (
                <div className="rounded-xl border bg-card p-4" key={category.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{category.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {category.slug || "—"}
                      </p>
                    </div>
                    <StatusBadge active={category.is_active} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Sıra: {category.sort_order}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        className="h-9"
                        onClick={() => setDialogState({ category })}
                        size="sm"
                        variant="outline"
                      >
                        <Pencil className="size-3.5" />
                        Düzenle
                      </Button>
                      <Button
                        className="h-9 text-destructive hover:text-destructive"
                        onClick={() => setDeleting(category)}
                        size="sm"
                        variant="outline"
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

      <ServicePackageCategoryFormDialog
        key={dialogState ? (dialogState.category?.id ?? "new") : "closed"}
        open={Boolean(dialogState)}
        category={dialogState?.category ?? null}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        open={Boolean(deleting)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paket kategorisini sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.name ?? ""}&quot; silinecek. Bu işlem geri
              alınamaz.
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
