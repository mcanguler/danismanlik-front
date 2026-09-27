"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import {
  useAdminSettingQuery,
  useCreateSetting,
  useUpdateSetting,
} from "@/lib/settings";
import { AdminFormPage } from "@/components/admin/admin-form-page";

const LIST_PATH = "/dashboard/admin/ayarlar";

const EXAMPLE_KEYS = [
  "site_name",
  "site_description",
  "contact.phone",
  "contact.email",
  "social.instagram",
  "footer.copyright",
];

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function SettingCreatePage() {
  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Ayarlar"
      title="Yeni Ayar"
      description="Site genelinde kullanılacak bir ayar tanımlayın"
      cardTitle="Ayar Bilgileri"
    >
      <SettingForm />
    </AdminFormPage>
  );
}

export function SettingEditPage({ id, query }) {
  const setting = query.data;

  if (query.isPending) {
    return (
      <AdminFormPage backHref={LIST_PATH} backLabel="Ayarlar" title="Ayarı Düzenle">
        <div className="flex justify-center py-10">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AdminFormPage>
    );
  }

  if (query.isError) {
    return (
      <AdminFormPage backHref={LIST_PATH} backLabel="Ayarlar" title="Ayarı Düzenle">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-destructive">
            {getErrorMessage(query.error)}
          </p>
          <Button onClick={() => query.refetch()} size="sm" variant="outline">
            Tekrar Dene
          </Button>
        </div>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Ayarlar"
      title="Ayarı Düzenle"
      description={setting?.key}
      cardTitle="Ayar Bilgileri"
    >
      <SettingForm key={setting.id} isEdit setting={setting} />
    </AdminFormPage>
  );
}

function SettingForm({ isEdit = false, setting = null }) {
  const router = useRouter();
  const create = useCreateSetting();
  const update = useUpdateSetting();
  const mutation = isEdit ? update : create;
  const [key, setKey] = useState(setting?.key ?? "");
  const [value, setValue] = useState(setting?.value ?? "");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setFieldErrors({});
    setError("");

    const nextErrors = {};
    if (!key.trim()) nextErrors.key = "Key zorunludur";
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const payload = { key: key.trim(), value };
    const onError = (mutationError) => {
      const mapped = {};
      for (const [field, messages] of Object.entries(
        mutationError.errors ?? {}
      )) {
        mapped[field] = Array.isArray(messages) ? messages[0] : messages;
      }
      setFieldErrors(mapped);
      if (
        !mutationError.errors ||
        Object.keys(mutationError.errors).length === 0
      ) {
        setError(getErrorMessage(mutationError));
      }
    };

    if (isEdit) {
      update.mutate(
        { id: setting.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Ayar güncellendi", type: "success" });
            router.push(LIST_PATH);
          },
          onError,
        }
      );
      return;
    }

    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Ayar oluşturuldu", type: "success" });
        router.push(LIST_PATH);
      },
      onError,
    });
  };

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="setting_key">Key</Label>
        <Input
          aria-invalid={Boolean(fieldErrors.key)}
          id="setting_key"
          onChange={(event) => {
            setKey(event.target.value);
            setFieldErrors({});
            setError("");
          }}
          placeholder="Örn: contact.phone"
          type="text"
          value={key}
        />
        <p className="text-xs text-muted-foreground">
          Gruplama için nokta notasyonu kullanabilirsiniz. Örnek:{" "}
          {EXAMPLE_KEYS.slice(0, 3).join(", ")}
        </p>
        {fieldErrors.key && (
          <p className="text-xs text-destructive">{fieldErrors.key}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="setting_value">Value</Label>
        <Textarea
          aria-invalid={Boolean(fieldErrors.value)}
          id="setting_value"
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          placeholder="Ayarın değeri"
          rows={3}
          value={value}
        />
        {fieldErrors.value && (
          <p className="text-xs text-destructive">{fieldErrors.value}</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center justify-end gap-2">
        <Button
          disabled={mutation.isPending}
          type="submit"
        >
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
