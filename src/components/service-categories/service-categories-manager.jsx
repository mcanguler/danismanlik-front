"use client";

import { useState } from "react";
import {
  CircleAlert,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  useDeleteServiceCategory,
  useServiceCategoriesQuery,
} from "@/lib/service-categories";
import { ServiceCategoryFormDialog } from "@/components/service-categories/service-category-form-dialog";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function CategoryAvatar({ category }) {
  return (
    <Avatar className="size-8 rounded-lg after:rounded-lg">
      <AvatarImage src={category.image} alt={category.name} className="rounded-lg" />
      <AvatarFallback className="rounded-lg">
        <ImageIcon className="size-4" />
      </AvatarFallback>
    </Avatar>
  );
}

export function ServiceCategoriesManager() {
  const [dialogState, setDialogState] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteServiceCategory();

  const query = useServiceCategoriesQuery();
  const categories = query.data ?? [];

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Kategori silindi", type: "success" });
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
          <h1 className="text-xl font-semibold tracking-tight">
            Hizmet Kategorileri
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {categories.length} kategori
          </p>
        </div>
        <Button
          size="lg"
          className="h-10"
          onClick={() => setDialogState({ category: null })}
        >
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
              {getErrorMessage(query.error)}
            </p>
            <Button variant="outline" onClick={() => query.refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && categories.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <Tags className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz kategori yok</p>
            <p className="text-sm text-muted-foreground">
              İlk kategoriyi ekleyerek başlayın
            </p>
            <Button
              variant="outline"
              onClick={() => setDialogState({ category: null })}
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
                    <TableHead className="pl-4 w-14">Görsel</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Sıra</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4">
                        <CategoryAvatar category={item} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.slug || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={item.is_active} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.sort_order}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDialogState({ category: item })}
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
              {categories.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <CategoryAvatar category={item} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.slug || "—"}
                      </p>
                    </div>
                    <StatusBadge active={item.is_active} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Sıra: {item.sort_order}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9"
                        onClick={() => setDialogState({ category: item })}
                      >
                        <Pencil className="size-3.5" />
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 text-destructive hover:text-destructive"
                        onClick={() => setDeleting(item)}
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

      <ServiceCategoryFormDialog
        key={dialogState ? (dialogState.category?.id ?? "new") : "closed"}
        open={Boolean(dialogState)}
        category={dialogState?.category ?? null}
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
            <AlertDialogTitle>Kategoriyi sil</AlertDialogTitle>
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