"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  LoaderCircle,
  Pencil,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useAdminSettingsQuery, useDeleteSetting } from "@/lib/settings";

const LIST_PATH = "/dashboard/admin/ayarlar";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function settingGroup(key) {
  const index = String(key).indexOf(".");
  if (index <= 0) return "Genel";
  return String(key).slice(0, index);
}

function SettingsGroup({ group, items, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <Settings className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold tracking-tight">{group}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {items.length}
        </span>
      </div>
      <div className="divide-y">
        {items.map((item) => (
          <div
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            key={item.id}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs font-medium">
                {item.key}
              </p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {item.value || "—"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                aria-label={`${item.key} düzenle`}
                onClick={() => onEdit(item)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                aria-label={`${item.key} sil`}
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
        ))}
      </div>
    </div>
  );
}

export function SettingsManager() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(null);
  const query = useAdminSettingsQuery();
  const deleteMutation = useDeleteSetting();

  const settings = useMemo(() => query.data?.items ?? [], [query.data]);
  const groups = useMemo(() => {
    const map = new Map();
    for (const item of settings) {
      const group = settingGroup(item.key);
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(item);
    }
    return [...map.entries()];
  }, [settings]);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Ayar silindi", type: "success" });
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
          <h1 className="text-xl font-semibold tracking-tight">Ayarlar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {query.data?.meta?.total ?? settings.length} ayar
          </p>
        </div>
        <Button onClick={() => router.push(`${LIST_PATH}/yeni`)} type="button">
          <Plus className="size-4" />
          Yeni Ayar
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-5">
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
            <Button onClick={() => query.refetch()} variant="outline">
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && settings.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <Settings className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz ayar bulunmuyor.</p>
            <p className="text-sm text-muted-foreground">
              Site adı, iletişim bilgileri ve sosyal medya bağlantıları gibi
              ayarları buradan yönetebilirsiniz.
            </p>
            <Button
              onClick={() => router.push(`${LIST_PATH}/yeni`)}
              variant="outline"
            >
              <Plus className="size-4" />
              İlk Ayarı Ekle
            </Button>
          </div>
        )}

        {groups.map(([group, items]) => (
          <SettingsGroup
            items={items}
            key={group}
            onDelete={setDeleting}
            onEdit={(item) =>
              router.push(`${LIST_PATH}/${encodeURIComponent(item.id)}`)
            }
          />
        ))}
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        open={Boolean(deleting)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ayarı sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.key ?? ""}&quot; ayarı kalıcı olarak silinecek.
              Bu işlem geri alınamaz.
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
