"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CalendarPlus,
  CircleCheck,
  Clock,
  Hourglass,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  Video,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RequireRole } from "@/components/require-role";
import { PhoneInput, normalizePhoneToE164 } from "@/components/phone-input";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
  useAppointmentsQuery,
} from "@/lib/appointments";
import {
  packageIsUsable,
  useMyServicePackagesQuery,
} from "@/lib/service-packages";
import { useAuth, useUpdateProfile } from "@/lib/auth-hooks";

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

export default function CustomerProfilePage() {
  return (
    <RequireRole role="CUSTOMER">
      <CustomerProfile />
    </RequireRole>
  );
}

function CustomerProfile() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(user),
  });

  useEffect(() => {
    if (!user) return;
    form.reset(toFormValues(user));
  }, [user?.id, user?.updated_at, form, user]);

  const createdAt = user?.created_at
    ? format(new Date(user.created_at), "MMMM yyyy", { locale: tr })
    : null;

  const packagesQuery = useMyServicePackagesQuery();
  const purchases = packagesQuery.data ?? [];
  const sessionTotals = purchases.reduce(
    (totals, purchase) => {
      totals.total += purchase.totalQuantity ?? 0;
      totals.used += purchase.usedQuantity ?? 0;
      if (packageIsUsable(purchase)) {
        totals.remaining += purchase.remainingQuantity ?? 0;
      }
      return totals;
    },
    { total: 0, used: 0, remaining: 0 }
  );
  const usageRate =
    sessionTotals.total > 0
      ? Math.round((sessionTotals.used / sessionTotals.total) * 100)
      : 0;

  const appointmentsQuery = useAppointmentsQuery();
  const appointments = appointmentsQuery.data ?? [];
  const fetchedAt = appointmentsQuery.dataUpdatedAt;
  const upcomingAppointments = appointments
    .filter((appointment) => {
      if (appointment.status === "CANCELLED" || !appointment.startAt) {
        return false;
      }
      return new Date(appointment.startAt).getTime() > fetchedAt;
    })
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )
    .slice(0, 3);

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
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8">
      {/* Hero Header */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-low p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 size-80 rounded-full bg-secondary-container/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-40 size-64 rounded-full bg-tertiary-fixed/15 blur-2xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-widest text-secondary">
                Danışan Portalı
              </span>
              <span className="size-1.5 rounded-full bg-accent-gold" />
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blush-surface px-3 py-1 font-label-sm text-label-sm font-medium text-primary shadow-sm">
                <BadgeCheck className="size-4 text-accent-gold" />
                Danışan Hesabı
              </div>
              {createdAt && (
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                  <CalendarDays className="size-3.5" />
                  Kayıt: {createdAt}
                </span>
              )}
            </div>
            <h1 className="mt-1 font-headline-lg text-headline-lg tracking-tight text-primary">
              Hoş Geldiniz,{" "}
              <span className="font-serif italic font-normal">
                {user?.first_name ?? user?.name ?? "Danışan"}
              </span>
            </h1>
            <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Kişisel bilgilerinizi ve iletişim tercihlerinizi bu alandan
              güvenle yönetebilirsiniz.
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

      {/* Profile Section */}
      <div className="mt-8 grid w-full grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Avatar & Profile Card */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="relative flex flex-col items-center overflow-hidden rounded-2xl bg-surface-container-lowest p-6 text-center shadow-sm">
            <div className="absolute left-0 top-0 h-24 w-full bg-gradient-to-br from-blush-surface to-secondary-fixed/30" />
            <div className="relative mb-4 mt-8">
              <div className="flex size-28 items-center justify-center rounded-full bg-primary-container font-headline-md text-headline-md text-on-primary shadow-md ring-4 ring-surface-container-lowest">
                {initialsOf(user)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-blush-surface text-primary shadow-md ring-2 ring-surface-container-lowest">
                <BadgeCheck className="size-4 text-accent-gold" />
              </div>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-primary">
              {user?.name ?? "Danışan"}
            </h2>
            <span className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
              Danışan
            </span>
            <div className="my-5 h-px w-full bg-surface-container-high" />
            <div className="flex w-full flex-col gap-3 text-left">
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Danışan No
                </span>
                <span className="font-label-md text-label-md font-semibold text-primary">
                  #{user?.id ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Hesap Durumu
                </span>
                <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary">
                  <CircleCheck className="size-3.5 text-accent-gold" />
                  Aktif
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

          <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-low p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />
              <h3 className="font-title-md text-title-md font-medium text-primary">
                Mahremiyet &amp; Gizlilik
              </h3>
            </div>
            <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
              Paylaştığınız tüm kişisel veriler ve seans notları 256-Bit SSL
              korumalı şifreleme ve Türk Psikologlar Derneği Etik Kuralları
              çerçevesinde korunur.
            </p>
          </div>
        </div>

        {/* Right Column: Personal Info Form */}
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
                      selectClassName="h-auto w-auto self-stretch rounded-xl border-0 bg-canvas-cream px-2.5 text-sm font-medium text-primary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30"
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

        {/* Session Packages Summary */}
      <div className="mt-10 w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-6 w-2.5 rounded-full bg-primary-container" />
            <h2 className="font-headline-sm text-headline-sm text-primary">
              Seans Paketlerim &amp; Kullanım Haklarım
            </h2>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 font-label-md text-label-md font-semibold text-burgundy-light hover:text-primary transition-colors"
            href="/dashboard/customer/paketlerim"
          >
            Paketlerime Git
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-4 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-5 transition-colors hover:bg-surface-container">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-canvas-pure text-primary shadow-sm">
              <BadgeCheck className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Toplam Alınan Seans
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  {sessionTotals.total}
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Seans
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-5 transition-colors hover:bg-surface-container">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-canvas-pure text-secondary shadow-sm">
              <CircleCheck className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Kullanılan Seanslar
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {sessionTotals.used}
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Seans
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-blush-surface p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary shadow-sm">
              <Hourglass className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                Kalan Aktif Seans
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  {sessionTotals.remaining}
                </span>
                {sessionTotals.total > 0 && (
                  <span className="rounded-full bg-canvas-pure px-2 py-0.5 font-label-sm text-label-sm font-bold text-accent-gold shadow-sm">
                    %{Math.max(0, 100 - usageRate)} Kalan
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-5 transition-colors hover:bg-surface-container">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Genel Kullanım Oranı
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                %{usageRate}
              </span>
              <span className="font-body-sm text-body-sm text-secondary">
                {sessionTotals.used} / {sessionTotals.total} Seans
              </span>
            </div>
            <div className="relative flex size-14 items-center justify-center">
              <svg
                className="size-14 -rotate-90 transform"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-surface-container-high"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-accent-gold"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${usageRate}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <BadgeCheck className="absolute size-4 text-accent-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-8 mt-10 w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-6 w-2.5 rounded-full bg-secondary" />
            <h2 className="font-headline-sm text-headline-sm text-primary">
              Yaklaşan Randevularım
            </h2>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 font-label-md text-label-md font-semibold text-burgundy-light hover:text-primary transition-colors"
            href="/appointments"
          >
            Tümünü Gör
            <ArrowRight className="size-4" />
          </Link>
        </div>
        {appointmentsQuery.isPending ? (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest p-10 shadow-sm">
            <LoaderCircle className="size-5 animate-spin text-secondary" />
            <span className="font-body-md text-body-md text-on-surface-variant">
              Randevularınız yükleniyor...
            </span>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl bg-surface-container-lowest p-10 text-center shadow-sm">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blush-surface text-primary">
              <CalendarPlus className="size-6 text-accent-gold" />
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-primary">
                Yaklaşan randevunuz bulunmuyor
              </span>
              <span className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                Yeni bir seans planlayarak yolculuğunuza devam edin.
              </span>
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-label-md text-label-md font-semibold text-on-primary shadow-md transition-colors hover:bg-burgundy-light"
              href="/hizmetler"
            >
              <CalendarPlus className="size-4" />
              Randevu Al
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
            {upcomingAppointments.map((appointment) => {
              const startDate = appointment.startAt
                ? new Date(appointment.startAt)
                : null;
              return (
                <div
                  className="flex flex-col justify-between gap-4 rounded-2xl bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md"
                  key={appointment.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blush-surface text-primary">
                        <span className="font-headline-sm text-headline-sm font-bold leading-none">
                          {startDate ? format(startDate, "d") : "—"}
                        </span>
                        <span className="font-label-sm text-label-sm uppercase">
                          {startDate ? format(startDate, "MMM", { locale: tr }) : ""}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-title-md text-title-md font-medium text-primary">
                          {appointment.serviceName ?? "Seans"}
                        </span>
                        <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                          {appointment.consultantName}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-semibold ${
                        APPOINTMENT_STATUS_BADGE_CLASSES[appointment.status] ??
                        ""
                      }`}
                    >
                      {APPOINTMENT_STATUS_LABELS[appointment.status] ??
                        appointment.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-surface-container-high pt-4">
                    <div className="flex min-w-0 items-center gap-3 text-on-surface-variant">
                      {startDate && (
                        <span className="flex items-center gap-1.5 font-label-md text-label-md">
                          <Clock className="size-3.5 text-accent-gold" />
                          {format(startDate, "HH:mm")}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 font-label-md text-label-md">
                        <Video className="size-3.5 text-accent-gold" />
                        Online
                      </span>
                    </div>
                    <Link
                      className="shrink-0 font-label-md text-label-md font-semibold text-burgundy-light hover:text-primary transition-colors"
                      href="/appointments"
                    >
                      Görüntüle
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
