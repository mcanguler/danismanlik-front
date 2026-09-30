"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { PhoneInput } from "@/components/phone-input";
import { KvkkModalLink } from "@/components/kvkk-modal";
import { ApiError } from "@/lib/api";
import { readRedirectParam, roleHomePath } from "@/lib/auth";
import { useAuth, useRegister } from "@/lib/auth-hooks";

const phoneRegex = /^\+\d{8,15}$/;

const registerSchema = z
  .object({
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
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
    password_confirmation: z.string().min(1, "Şifre tekrarı zorunludur"),
    consent: z.literal(true, {
      message: "Devam etmek için KVKK metnini onaylamanız gerekir",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor",
    path: ["password_confirmation"],
  });

const INPUT_CLASS =
  "w-full h-11 rounded-xl border-0 bg-canvas-cream px-3.5 font-body-md text-body-md text-on-surface placeholder:text-outline outline-none transition-colors focus-visible:bg-canvas-pure focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:ring-3 aria-invalid:ring-destructive/20";

function authHref(path, redirect) {
  if (!redirect) return path;
  return `${path}?redirect=${encodeURIComponent(redirect)}`;
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function RegisterForm() {
  const register = useRegister();
  const router = useRouter();
  const { user } = useAuth();
  const [redirect] = useState(() => readRedirectParam());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      password_confirmation: "",
      consent: false,
    },
  });

  useEffect(() => {
    if (!register.isSuccess) return;
    if (user) {
      router.replace(redirect ?? roleHomePath(user.role));
    } else {
      router.replace(redirect ?? "/login");
    }
  }, [register.isSuccess, user, router, redirect]);

  useEffect(() => {
    if (!register.isError || !(register.error instanceof ApiError)) return;
    const error = register.error;
    if (error.errors) {
      for (const [field, messages] of Object.entries(error.errors)) {
        if (
          ["first_name", "last_name", "phone", "email", "password"].includes(
            field
          )
        ) {
          const message = Array.isArray(messages) ? messages[0] : messages;
          form.setError(field, { message });
        }
      }
    }
    form.setError("root", { message: error.message });
  }, [register.isError, register.error, form]);

  const onSubmit = form.handleSubmit(({ email, ...values }) => {
    register.mutate(email ? { ...values, email } : values);
  });

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-canvas-pure p-6 shadow-md sm:p-8">
      <h1 className="font-headline-md text-headline-md font-semibold text-primary">
        Kayıt Ol
      </h1>
      <p className="mt-1.5 font-body-md text-body-md text-on-surface-variant">
        Hesabınızı oluşturun; sepetiniz giriş sonrası sizinle kalır.
      </p>
      <form className="mt-6 flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              className="font-label-md text-label-md font-semibold text-on-surface"
              htmlFor="first_name"
            >
              Ad
            </label>
            <input
              autoComplete="given-name"
              className={INPUT_CLASS}
              id="first_name"
              placeholder="Adınız"
              aria-invalid={Boolean(form.formState.errors.first_name)}
              {...form.register("first_name")}
            />
            <FieldError message={form.formState.errors.first_name?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="font-label-md text-label-md font-semibold text-on-surface"
              htmlFor="last_name"
            >
              Soyad
            </label>
            <input
              autoComplete="family-name"
              className={INPUT_CLASS}
              id="last_name"
              placeholder="Soyadınız"
              aria-invalid={Boolean(form.formState.errors.last_name)}
              {...form.register("last_name")}
            />
            <FieldError message={form.formState.errors.last_name?.message} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="font-label-md text-label-md font-semibold text-on-surface"
            htmlFor="phone"
          >
            Telefon Numarası
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
                selectClassName="h-11 w-auto rounded-xl border-0 bg-canvas-cream px-2.5 text-sm font-medium text-on-surface outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40"
                inputClassName="h-11 rounded-xl border-0 bg-canvas-cream px-3.5 font-body-md text-body-md text-on-surface outline-none transition-colors focus-visible:bg-canvas-pure focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:ring-3 aria-invalid:ring-destructive/20"
              />
            )}
          />
          <FieldError message={form.formState.errors.phone?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="font-label-md text-label-md font-semibold text-on-surface"
            htmlFor="email"
          >
            E-posta{" "}
            <span className="font-normal text-on-surface-variant">
              (opsiyonel)
            </span>
          </label>
          <input
            autoComplete="email"
            className={INPUT_CLASS}
            id="email"
            placeholder="ornek@alanadi.com"
            type="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
          <FieldError message={form.formState.errors.email?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="font-label-md text-label-md font-semibold text-on-surface"
            htmlFor="password"
          >
            Şifre
          </label>
          <div className="relative">
            <input
              autoComplete="new-password"
              className={`${INPUT_CLASS} pr-10`}
              id="password"
              placeholder="En az 8 karakter"
              type={showPassword ? "text" : "password"}
              aria-invalid={Boolean(form.formState.errors.password)}
              {...form.register("password")}
            />
            <button
              aria-label="Şifreyi göster veya gizle"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <FieldError message={form.formState.errors.password?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="font-label-md text-label-md font-semibold text-on-surface"
            htmlFor="password_confirmation"
          >
            Şifre Tekrarı
          </label>
          <div className="relative">
            <input
              autoComplete="new-password"
              className={`${INPUT_CLASS} pr-10`}
              id="password_confirmation"
              placeholder="••••••••"
              type={showConfirm ? "text" : "password"}
              aria-invalid={Boolean(form.formState.errors.password_confirmation)}
              {...form.register("password_confirmation")}
            />
            <button
              aria-label="Şifreyi göster veya gizle"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
              onClick={() => setShowConfirm((current) => !current)}
              type="button"
            >
              {showConfirm ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <FieldError
            message={form.formState.errors.password_confirmation?.message}
          />
        </div>
        <label className="flex items-start gap-2.5">
          <input
            className="mt-0.5 size-4 shrink-0 rounded accent-primary"
            type="checkbox"
            {...form.register("consent")}
          />
          <span className="font-body-sm text-body-sm text-on-surface">
          <KvkkModalLink className="font-semibold text-primary underline underline-offset-2 hover:text-burgundy-light" />
            &apos;ni okudum ve onaylıyorum.
          </span>
        </label>
        <FieldError message={form.formState.errors.consent?.message} />
        <FieldError message={form.formState.errors.root?.message} />
        <button
          className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-label-lg text-label-lg font-semibold text-on-primary transition-colors hover:bg-burgundy-light disabled:pointer-events-none disabled:opacity-60"
          disabled={register.isPending}
          type="submit"
        >
          {register.isPending && (
            <LoaderCircle className="size-4 animate-spin" />
          )}
          Kayıt Ol
        </button>
      </form>
      <p className="mt-5 text-center font-body-sm text-body-sm text-on-surface-variant">
        Zaten hesabınız var mı?{" "}
        <Link
          className="font-semibold text-primary hover:text-burgundy-light"
          href={authHref("/login", redirect)}
        >
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
