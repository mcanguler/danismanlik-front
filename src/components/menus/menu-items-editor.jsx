"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CircleAlert,
  CornerDownRight,
  Link2,
  ListTree,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { resolveMenuItemHref } from "@/lib/menu-link-sources";
import {
  useAdminMenuItemsQuery,
  useAdminMenuQuery,
  useDeleteMenuItem,
  useUpdateMenuItem,
} from "@/lib/menus";
import { MenuItemFormDialog } from "@/components/menus/menu-item-form-dialog";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function buildTree(flatItems) {
  const byParent = new Map();
  for (const item of flatItems) {
    const key = item.parent_id == null ? "root" : String(item.parent_id);
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  }
  const attach = (key) =>
    (byParent.get(key) ?? []).map((item) => ({
      item,
      children: attach(String(item.id)),
    }));
  return attach("root");
}

function MenuItemNode({
  node,
  depth,
  flatItems,
  menuId,
  onAddChild,
  onEdit,
  onDelete,
  onMoveToRoot,
  moving,
}) {
  const { item, children } = node;
  const href = resolveMenuItemHref(item);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={cn("flex flex-col gap-2", depth > 0 && "mt-2")}>
      <div
        className="flex flex-wrap items-center gap-2 rounded-xl border bg-background px-3 py-2.5"
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <button
          aria-label={expanded ? "Daralt" : "Genişlet"}
          className={cn(
            "flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent",
            children.length === 0 && "invisible"
          )}
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          <ChevronRight
            className={cn("size-3.5 transition-transform", expanded && "rotate-90")}
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {depth > 0 && (
              <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <p className="truncate text-sm font-medium">{item.title}</p>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Link2 className="size-3 shrink-0" />
            {href}
            <span className="shrink-0">· Sıra: {item.sort_order}</span>
            {item.target === "_blank" && <span className="shrink-0">· Yeni sekme</span>}
            {item.page?.slug && (
              <span className="shrink-0 font-mono">· CMS: {item.page.slug}</span>
            )}
          </p>
        </div>
        <StatusBadge active={item.is_active} />
        <div className="flex items-center gap-0.5">
          {item.parent_id != null && (
            <Button
              disabled={item.parent_id == null || item.parent_id === 0}
              onClick={onMoveToRoot}
              size="icon-sm"
              type="button"
              variant="ghost"
              aria-label="Root seviyeye taşı"
            >
              <Undo2 className="size-4" />
            </Button>
          )}
          <Button
            aria-label={`${item.title} alt öğe ekle`}
            onClick={() => onAddChild(item)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Plus className="size-4" />
          </Button>
          <Button
            aria-label={`${item.title} düzenle`}
            onClick={() => onEdit(item)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            aria-label={`${item.title} sil`}
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(item)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      {expanded &&
        children.map((child) => (
          <MenuItemNode
            depth={depth + 1}
            flatItems={flatItems}
            key={child.item.id}
            node={child}
            onAddChild={onAddChild}
            onDelete={onDelete}
            onEdit={onEdit}
            onMoveToRoot={onMoveToRoot}
          />
        ))}
    </div>
  );
}

export function MenuItemsEditor({ menuId }) {
  const menuQuery = useAdminMenuQuery(menuId);
  const itemsQuery = useAdminMenuItemsQuery(menuId);
  const updateItem = useUpdateMenuItem(menuId);
  const deleteItem = useDeleteMenuItem(menuId);

  const [dialogState, setDialogState] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const menu = menuQuery.data.data;
  const flatItems = itemsQuery.data ?? [];
  const tree = buildTree(flatItems);

  const moveToRoot = (item) => {
    updateItem.mutate(
      { id: item.id, payload: { parent_id: null } },
      {
        onSuccess: () => {
          toast.add({ title: "Öğe root seviyeye taşındı", type: "success" });
        },
        onError: (error) => {
          toast.add({
            title: "Taşıma başarısız",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteItem.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Menü öğesi silindi", type: "success" });
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

  console.log(menu)

  if (menuQuery.isPending || itemsQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (menuQuery.isError || !menu) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
          <CircleAlert className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Menü yüklenemedi</p>
          <p className="text-sm text-muted-foreground">
            {getQueryErrorMessage(menuQuery.error)}
          </p>
          <Button
            render={<Link href="/dashboard/admin/menuler" />}
            variant="outline"
          >
            Menülere Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/dashboard/admin/menuler"
        >
          ← Menüler
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <ListTree className="size-5 text-primary-container" />
          <h1 className="text-xl font-semibold tracking-tight">{menu.name}</h1>
          <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            {menu.slug}
          </span>
          <StatusBadge active={menu.is_active} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b [.border-b]:pb-4">
          <CardTitle>Menü Öğeleri</CardTitle>
          <Button
            className="h-9"
            onClick={() =>
              setDialogState({ item: null, defaultParentId: null })
            }
            type="button"
          >
            <Plus className="size-4" />
            Root Öğe Ekle
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {tree.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center">
              <ListTree className="size-7 text-muted-foreground" />
              <p className="text-sm font-medium">Henüz öğe yok</p>
              <p className="text-sm text-muted-foreground">
                Root öğe ekleyerek menü ağacını oluşturun
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {tree.map((node) => (
                <MenuItemNode
                  depth={0}
                  key={node.item.id}
                  node={node}
                  onAddChild={(parent) =>
                    setDialogState({
                      item: null,
                      defaultParentId: parent.id,
                    })
                  }
                  onDelete={setDeleting}
                  onEdit={(item) => setDialogState({ item, defaultParentId: null })}
                  onMoveToRoot={moveToRoot}
                />
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Öğe silindiğinde alt öğeleri de silinir. Sıralama ve parent
            değişiklikleri düzenleme ekranından yapılır; backend döngü ve geçersiz
            parent kontrollerini yapar.
          </p>
        </CardContent>
      </Card>

      <MenuItemFormDialog
        defaultParentId={dialogState?.defaultParentId ?? null}
        flatItems={flatItems}
        item={dialogState?.item ?? null}
        key={
          dialogState
            ? `item-${dialogState.item?.id ?? "new"}-${dialogState.defaultParentId ?? "root"}`
            : "closed"
        }
        menuId={menu.id}
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
            <AlertDialogTitle>Menü öğesini sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.title ?? ""}&quot; öğesi ve alt öğeleri silinecek.
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={deleteItem.isPending}
              onClick={handleDelete}
              variant="destructive"
            >
              {deleteItem.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteItem.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getQueryErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}
