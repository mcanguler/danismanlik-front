"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CircleAlert,
  ListTree,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
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
import { getQueryErrorMessage } from "@/lib/query-errors";
import {
  HEADER_MENU_SLUG,
  useAdminMenusQuery,
  useCreateMenu,
  useDeleteMenu,
  useUpdateMenu,
} from "@/lib/menus";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function MenuFormDialog({ open, menu, onOpenChange }) {
  const isEdit = Boolean(menu);
  const create = useCreateMenu();
  const update = useUpdateMenu();
  const mutation = isEdit ? update : create;
  const [name, setName] = useState(menu?.name ?? "");
  const [isActive, setIsActive] = useState(
    menu ? Boolean(menu.is_active) : true
  );
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Menü adı zorunludur");
      return;
    }

    const payload = { name: trimmedName, is_active: isActive };

    if (isEdit) {
      mutation.mutate(
        { id: menu.id, payload },
        {
          onSuccess: (updated) => {
            toast.add({ title: "Menü güncellendi", type: "success" });
            setName(updated.name ?? trimmedName);
            setIsActive(Boolean(updated.is_active));
            setError("");
            onOpenChange(false);
          },
          onError: (mutationError) => {
            setError(getErrorMessage(mutationError));
          },
        }
      );
      return;
    }

    mutation.mutate(
      { name: trimmedName, is_active: isActive },
      {
        onSuccess: () => {
          toast.add({ title: "Menü oluşturuldu", type: "success" });
          setError("");
          onOpenChange(false);
        },
        onError: (mutationError) => {
          setError(getErrorMessage(mutationError));
        },
      }
    );
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Menüyü Düzenle" : "Yeni Menü"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? menu?.slug
                ? `Public adres: /api/v1/menus/${menu.slug}`
                : "Menü bilgilerini güncelleyin"
              : "Slug, menü adından otomatik oluşturulur"}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="menu_name">Menü Adı</Label>
            <Input
              id="menu_name"
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="Örn. Header Ana Menü"
              type="text"
              value={name}
            />
          </div>
          {isEdit && menu?.slug && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="menu_slug">Slug</Label>
              <Input
                disabled
                id="menu_slug"
                readOnly
                type="text"
                value={menu.slug}
              />
              <p className="text-xs text-muted-foreground">
                Menü adı değişirse otomatik güncellenir
              </p>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="menu_is_active">Aktif</Label>
              <p className="text-xs text-muted-foreground">
                Aktif menüler public tarafta kullanılabilir
              </p>
            </div>
            <Switch
              checked={isActive}
              id="menu_is_active"
              onCheckedChange={setIsActive}
            />
          </div>
          {isEdit && menu?.slug === HEADER_MENU_SLUG && (
            <p className="rounded-lg bg-blush-surface px-3 py-2 text-xs text-primary">
              Bu menü site header&apos;ında otomatik olarak kullanılır.
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              className="h-10"
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              İptal
            </Button>
            <Button className="h-10" disabled={mutation.isPending} type="submit">
              {mutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {mutation.isPending
                ? "Kaydediliyor..."
                : isEdit
                  ? "Kaydet"
                  : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MenusManager() {
  const query = useAdminMenusQuery();
  const menus = query.data ?? [];
  const deleteMutation = useDeleteMenu();
  const [dialogState, setDialogState] = useState(null);
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
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Menüler</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {menus.length} menü · Header menüsü için slug:{" "}
            <span className="font-mono">{HEADER_MENU_SLUG}</span>
          </p>
        </div>
        <Button className="h-10" onClick={() => setDialogState({ menu: null })}>
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
              onClick={() => setDialogState({ menu: null })}
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
                    onClick={() => setDialogState({ menu })}
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

      <MenuFormDialog
        key={dialogState ? (dialogState.menu?.id ?? "new") : "closed"}
        menu={dialogState?.menu ?? null}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
        open={Boolean(dialogState)}
      />

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
