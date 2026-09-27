"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  ListTree,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
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
import { getQueryErrorMessage } from "@/lib/query-errors";
import {
  HEADER_MENU_SLUG,
  useAdminMenusQuery,
  useDeleteMenu,
} from "@/lib/menus";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function MenusManager() {
  const router = useRouter();
  const query = useAdminMenusQuery();
  const menus = query.data ?? [];
  const deleteMutation = useDeleteMenu();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Menü silindi", type: "success" });
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
          <h1 className="text-xl font-semibold tracking-tight">Menüler</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {menus.length} menü · Header menüsü için slug:{" "}
            <span className="font-mono">{HEADER_MENU_SLUG}</span>
          </p>
        </div>
        <Button
          className="h-10"
          onClick={() => router.push("/dashboard/admin/menuler/yeni")}
        >
          <Plus className="size-4" />
          Yeni Menü
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

        {query.isSuccess && menus.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <ListTree className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz menü yok</p>
            <p className="text-sm text-muted-foreground">
              Site header&apos;ı için &quot;{HEADER_MENU_SLUG}&quot; slug&apos;lı
              bir menü oluşturabilirsiniz
            </p>
            <Button
              onClick={() => router.push("/dashboard/admin/menuler/yeni")}
              variant="outline"
            >
              <Plus className="size-4" />
              Yeni Menü
            </Button>
          </div>
        )}

        {query.isSuccess && menus.length > 0 && (
          <div className="flex flex-col gap-3">
            {menus.map((menu) => (
              <div
                className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4"
                key={menu.id}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blush-surface text-primary-container">
                  <ListTree className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    className="truncate font-medium underline-offset-4 hover:underline"
                    href={`/dashboard/admin/menuler/${menu.id}`}
                  >
                    {menu.name}
                  </Link>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {menu.slug}
                    {menu.slug === HEADER_MENU_SLUG ? " · Header menüsü" : ""}
                  </p>
                </div>
                <StatusBadge active={menu.is_active} />
                <div className="flex items-center gap-1">
                  <Button
                    render={
                      <Link href={`/dashboard/admin/menuler/${menu.id}`} />
                    }
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Pencil className="size-3.5" />
                    Öğeleri Düzenle
                  </Button>
                  <Button
                    aria-label={`${menu.name} düzenle`}
                    onClick={() =>
                      router.push(`/dashboard/admin/menuler/${menu.id}/duzenle`)
                    }
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    aria-label={`${menu.name} sil`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(menu)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        open={Boolean(deleting)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Menüyü sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.name ?? ""}&quot; menüsü tüm öğeleriyle birlikte
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
