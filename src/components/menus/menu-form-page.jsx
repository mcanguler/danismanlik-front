"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import {
  HEADER_MENU_SLUG,
  useCreateMenu,
  useUpdateMenu,
} from "@/lib/menus";
import { AdminFormPage } from "@/components/admin/admin-form-page";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function MenuCreatePage() {
  return (
    <AdminFormPage
      backHref="/dashboard/admin/menuler"
      backLabel="Menüler"
      title="Yeni Menü"
      description="Slug, menü adından otomatik oluşturulur"
      cardTitle="Menü Bilgileri"
    >
      <MenuForm isEdit={false} menu={null} />
    </AdminFormPage>
  );
}

export function MenuEditPage({ id, query }) {
  const menu = query.data;

  if (query.isPending) {
    return (
      <AdminFormPage
        backHref="/dashboard/admin/menuler"
        backLabel="Menüler"
        title="Menüyü Düzenle"
      >
        <div className="flex justify-center py-10">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AdminFormPage>
    );
  }

  if (query.isError) {
    return (
      <AdminFormPage
        backHref="/dashboard/admin/menuler"
        backLabel="Menüler"
        title="Menüyü Düzenle"
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-destructive">{getErrorMessage(query.error)}</p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Tekrar Dene
          </Button>
        </div>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref="/dashboard/admin/menuler"
      backLabel="Menüler"
      title="Menüyü Düzenle"
      description={
        menu?.slug
          ? `Public adres: /api/v1/menus/${menu.slug}`
          : "Menü bilgilerini güncelleyin"
      }
      cardTitle="Menü Bilgileri"
    >
      <MenuForm key={menu.id} isEdit menu={menu} />
    </AdminFormPage>
  );
}

function MenuForm({ isEdit, menu }) {
  const router = useRouter();
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
          onSuccess: () => {
            toast.add({ title: "Menü güncellendi", type: "success" });
            router.push("/dashboard/admin/menuler");
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
          router.push("/dashboard/admin/menuler");
        },
        onError: (mutationError) => {
          setError(getErrorMessage(mutationError));
        },
      }
    );
  };

  return (
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
      <div className="flex items-center justify-end gap-2">
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
      </div>
    </form>
  );
}
