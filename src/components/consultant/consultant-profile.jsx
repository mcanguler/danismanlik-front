"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  BadgeCheck,
  Briefcase,
  CircleCheck,
  LoaderCircle,
  Mail,
  Phone,
  Save,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PhoneInput, normalizePhoneToE164 } from "@/components/phone-input";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { ConsultantCertificates } from "@/components/consultant/consultant-certificates";
import { useMyConsultant } from "@/lib/consultant-scope";
import { useAuth, useUpdateProfile } from "@/lib/auth-hooks";
import { useConsultantQuery } from "@/lib/consultants";

const phoneRegex = /^\+\d{8,15}$/;

const profileSchema = z.object({
  first_name: z.string().min(1, "Ad zorunludur"),
  last_name: z.string().min(1, "Soyad zorunludur"),
  phone: z
    .string()
    .min(1, "Telefon numarası zorunludur")
    .regex(phoneRegex, "Geçerli bir telefon numarası girin"),
  email: z.union([
    z.literal(""),
    z.string().trim().email("Geçerli bir e-posta girin"),
  ]),
});

function toFormValues(user) {
  return {
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
  };
}

function initialsOf(user) {
  const source = `${user?.first_name ?? user?.name ?? ""} ${user?.last_name ?? ""}`.trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ConsultantProfilePage() {
  const { user } = useAuth();
  const { consultantId, hasConsultant } = useMyConsultant();
  const updateProfile = useUpdateProfile();
  const consultantQuery = useConsultantQuery(hasConsultant ? consultantId : null);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(user),
  });

  useEffect(() => {
    if (!user) return;
    form.reset(toFormValues(user));
  }, [user?.id, user?.updated_at, form, user]);

  const consultant = consultantQuery.data ?? null;
  const createdAt = user?.created_at
    ? format(new Date(user.created_at), "MMMM yyyy", { locale: tr })
    : null;

  const onSubmit = form.handleSubmit((values) => {
    updateProfile.mutate(
      {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: normalizePhoneToE164(values.phone),
        email: values.email.trim() ? values.email.trim() : null,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Bilgileriniz güncellendi",
            type: "success",
          });
        },
        onError: (error) => {
          if (error instanceof ApiError && error.errors) {
            for (const [field, messages] of Object.entries(error.errors)) {
              if (
                field === "first_name" ||
                field === "last_name" ||
                field === "phone" ||
                field === "email"
              ) {
                const message = Array.isArray(messages)
                  ? messages[0]
                  : messages;
                form.setError(field, { message });
              }
            }
          }
          form.setError("root", {
            message:
              error instanceof ApiError
                ? error.message
                : "Bilgiler güncellenemedi. Lütfen tekrar deneyin.",
          });
        },
      }
    );
  });

  const fieldClass =
    "w-full px-4 py-3 rounded-xl bg-canvas-cream text-on-surface font-body-md text-body-md outline-none transition-all focus-visible:bg-canvas-pure focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:ring-3 aria-invalid:ring-destructive/20";

  return (
    <div className="w-full flex-1 px-4 py-6 lg:px-8">
      <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-low p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 size-80 rounded-full bg-secondary-container/20 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-widest text-secondary">
                Danışman Portalı
              </span>
              <span className="size-1.5 rounded-full bg-accent-gold" />
              {createdAt && (
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                  <BadgeCheck className="size-3.5" />
                  Kayıt: {createdAt}
                </span>
              )}
            </div>
            <h1 className="mt-1 font-headline-lg text-headline-lg tracking-tight text-primary">
              Profilim
            </h1>
            <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Hesap bilgilerinizi bu alandan güvenle yönetebilirsiniz.
              Değişiklikler yalnızca kendi hesabınıza uygulanır.
            </p>
          </div>
          <div className="flex min-w-[240px] items-center gap-5 rounded-2xl bg-surface-container-lowest/80 p-5 shadow-sm backdrop-blur-md">
            <div className="flex size-12 items-center justify-center rounded-xl bg-blush-surface text-primary">
              <Phone className="size-6 text-accent-gold" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Giriş Kimliğiniz
              </span>
              <span className="truncate font-title-md text-title-md font-medium text-primary">
                {user?.phone ?? "—"}
              </span>
              <span className="mt-0.5 font-label-sm text-label-sm text-secondary">
                {user?.email ?? "E-posta tanımlı değil"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid w-full grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="relative flex flex-col items-center overflow-hidden rounded-2xl bg-surface-container-lowest p-6 text-center shadow-sm">
            <div className="absolute left-0 top-0 h-24 w-full bg-gradient-to-br from-blush-surface to-secondary-fixed/30" />
            <div className="relative mb-4 mt-8">
              <div className="flex size-28 items-center justify-center rounded-full bg-primary-container font-headline-md text-headline-md text-on-primary shadow-md ring-4 ring-surface-container-lowest">
                {initialsOf(user)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-blush-surface text-primary shadow-md ring-2 ring-surface-container-lowest">
                <Briefcase className="size-4 text-accent-gold" />
              </div>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-primary">
              {user?.name ?? "Danışman"}
            </h2>
            <span className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
              {consultant?.title ?? "Danışman"}
            </span>
            <div className="my-5 h-px w-full bg-surface-container-high" />
            <div className="flex w-full flex-col gap-3 text-left">
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Danışman No
                </span>
                <span className="font-label-md text-label-md font-semibold text-primary">
                  #{consultantId ?? user?.id ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Hesap Durumu
                </span>
                <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary">
                  <CircleCheck className="size-3.5 text-accent-gold" />
                  {hasConsultant ? "Aktif" : "Profil Bekliyor"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  E-Posta
                </span>
                <span className="max-w-[55%] truncate font-label-sm text-label-sm font-semibold text-primary">
                  {user?.email ?? "—"}
                </span>
              </div>
            </div>
          </div>

          {consultant?.biography && (
            <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-6 w-2.5 rounded-full bg-accent-gold" />
                <h2 className="font-title-md text-title-md text-primary">
                  Hakkımda
                </h2>
              </div>
              <p className="mt-4 whitespace-pre-line font-body-md text-body-md text-on-surface-variant">
                {consultant.biography}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8 lg:col-span-8">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-surface-container-high pb-6">
              <div className="flex items-center gap-3">
                <span className="h-6 w-2.5 rounded-full bg-accent-gold" />
                <h2 className="font-title-lg text-title-lg text-primary">
                  Kişisel Bilgileri Düzenle
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                * Zorunlu Alanlar
              </span>
            </div>
            <form
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
              noValidate
              onSubmit={onSubmit}
            >
              <div className="flex flex-col gap-2">
                <label
                  className="font-label-md text-label-md font-semibold text-on-surface"
                  htmlFor="first_name"
                >
                  Ad *
                </label>
                <input
                  autoComplete="given-name"
                  className={fieldClass}
                  id="first_name"
                  placeholder="Adınız"
                  aria-invalid={Boolean(form.formState.errors.first_name)}
                  {...form.register("first_name")}
                />
                {form.formState.errors.first_name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="font-label-md text-label-md font-semibold text-on-surface"
                  htmlFor="last_name"
                >
                  Soyad *
                </label>
                <input
                  autoComplete="family-name"
                  className={fieldClass}
                  id="last_name"
                  placeholder="Soyadınız"
                  aria-invalid={Boolean(form.formState.errors.last_name)}
                  {...form.register("last_name")}
                />
                {form.formState.errors.last_name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.last_name.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="font-label-md text-label-md font-semibold text-on-surface"
                  htmlFor="phone"
                >
                  Telefon / WhatsApp No *
                </label>
                <Controller
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <PhoneInput
                      autoComplete="tel"
                      id="phone"
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={Boolean(form.formState.errors.phone)}
                      selectClassName="w-auto self-stretch rounded-xl border-0 bg-canvas-cream px-2.5 text-sm font-medium text-primary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30"
                      inputClassName="h-auto rounded-xl border-0 bg-canvas-cream px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all focus-visible:bg-canvas-pure focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                    />
                  )}
                />
                <p className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                  <Phone className="size-3.5 text-accent-gold" />
                  Giriş kimliğinizdir; değiştirirseniz yeni numarayla giriş
                  yaparsınız.
                </p>
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="font-label-md text-label-md font-semibold text-on-surface"
                  htmlFor="email"
                >
                  E-Posta Adresi{" "}
                  <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">
                    (opsiyonel)
                  </span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    autoComplete="email"
                    className={`${fieldClass} pl-11`}
                    id="email"
                    placeholder="ornek@alanadi.com"
                    type="email"
                    aria-invalid={Boolean(form.formState.errors.email)}
                    {...form.register("email")}
                  />
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Boş bırakırsanız kayıtlı e-posta adresiniz silinir.
                </p>
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              {form.formState.errors.root && (
                <p className="text-sm text-destructive md:col-span-2">
                  {form.formState.errors.root.message}
                </p>
              )}
              <div className="flex justify-end pt-2 md:col-span-2">
                <button
                  className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-label-lg text-label-lg font-semibold text-on-primary shadow-md transition-all hover:bg-burgundy-light hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
                  disabled={updateProfile.isPending}
                  type="submit"
                >
                  {updateProfile.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {hasConsultant && (
        <div className="mt-8 w-full">
          <ConsultantCertificates />
        </div>
      )}
    </div>
  );
}
