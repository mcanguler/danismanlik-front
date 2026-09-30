"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";
import { roleHomePath, readRedirectParam } from "@/lib/auth";
import { useAuth, useLogin } from "@/lib/auth-hooks";
import { PhoneInput } from "@/components/phone-input";

const phoneRegex = /^\+\d{8,15}$/;

const phoneField = z
  .string()
  .min(1, "Telefon numarası zorunludur")
  .regex(phoneRegex, "Geçerli bir telefon numarası girin");

const loginSchema = z.object({
  phone: phoneField,
  password: z.string().min(1, "Şifre zorunludur"),
});

const forgotSchema = z.object({ phone: phoneField });

const resetSchema = z
  .object({
    code: z.string().regex(/^\d{6}$/, "6 haneli sıfırlama kodunu girin"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
    password_confirmation: z.string().min(1, "Şifre tekrarı zorunludur"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor",
    path: ["password_confirmation"],
  });

const INPUT_CLASS =
  "w-full h-11 rounded-xl border-0 bg-surface-container-low px-3.5 font-body-md text-body-md text-on-surface placeholder:text-outline outline-none transition-colors focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:ring-3 aria-invalid:ring-destructive/20";

const PHONE_INPUT_PROPS = {
  selectClassName:
    "h-11 w-auto rounded-xl border-0 bg-surface-container-low px-2.5 text-sm font-medium text-on-surface outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
  inputClassName:
    "h-11 rounded-xl border-0 bg-surface-container-low px-3.5 font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring/50",
};

function authHref(path, redirect) {
  if (!redirect) return path;
  return `${path}?redirect=${encodeURIComponent(redirect)}`;
}

function PhoneField({ control, name, errors, id }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <PhoneInput
          autoComplete="tel"
          id={id}
          value={field.value}
          onChange={field.onChange}
          aria-invalid={Boolean(errors[name])}
          {...PHONE_INPUT_PROPS}
        />
      )}
    />
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function LoginForm() {
  const login = useLogin();
  const router = useRouter();
  const { user } = useAuth();
  const [redirect] = useState(() => readRedirectParam());
  const [view, setView] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState("phone");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotNote, setForgotNote] = useState(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const forgotForm = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { phone: "" },
  });

  const resetForm = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: "", password: "", password_confirmation: "" },
  });

  const forgot = useMutation({
    mutationFn: (phone) => api.forgotPassword(phone),
  });

  const reset = useMutation({
    mutationFn: (payload) => api.resetPassword(payload),
    onSuccess: () => {
      setForgotStep("done");
      toast.add({
        title: "Şifreniz güncellendi",
        description: "Yeni şifrenizle giriş yapabilirsiniz.",
        type: "success",
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) {
        for (const [field, messages] of Object.entries(error.errors)) {
          if (
            field === "code" ||
            field === "password" ||
            field === "password_confirmation"
          ) {
            const message = Array.isArray(messages) ? messages[0] : messages;
            resetForm.setError(field, { message });
          }
        }
      }
      resetForm.setError("root", {
        message:
          error instanceof ApiError
            ? error.message
            : "Şifre sıfırlanamadı. Lütfen tekrar deneyin.",
      });
    },
  });

  useEffect(() => {
    if (!login.isSuccess) return;
    if (user) {
      router.replace(redirect ?? roleHomePath(user.role));
    }
  }, [login.isSuccess, user, router, redirect]);

  useEffect(() => {
    if (!login.isError || !(login.error instanceof ApiError)) return;
    const error = login.error;
    if (error.errors) {
      for (const [field, messages] of Object.entries(error.errors)) {
        if (field === "phone" || field === "password") {
          const message = Array.isArray(messages) ? messages[0] : messages;
          form.setError(field, { message });
        }
      }
    }
    form.setError("root", { message: error.message });
  }, [login.isError, login.error, form]);

  const onSubmitLogin = form.handleSubmit((values) => {
    login.mutate(values);
  });

  const onSubmitForgot = forgotForm.handleSubmit(({ phone }) => {
    setForgotNote(null);
    api
      .phoneExists(phone)
      .then((data) => {
        if (!data?.exists) {
          setForgotNote(
            "Bu numara sistemde kayıtlı görünmüyor. Yeni hesap oluşturmak için kayıt olabilirsiniz."
          );
          return;
        }
        setForgotPhone(phone);
        forgot.mutate(phone, {
          onSuccess: () => {
            resetForm.reset();
            setForgotStep("reset");
          },
          onError: () => {
            setForgotNote(
              "Kod gönderilemedi. Lütfen bir süre sonra tekrar deneyin."
            );
          },
        });
      })
      .catch(() => {
        setForgotPhone(phone);
        forgot.mutate(phone, {
          onSuccess: () => {
            resetForm.reset();
            setForgotStep("reset");
          },
          onError: () => {
            setForgotNote(
              "Kod gönderilemedi. Lütfen bir süre sonra tekrar deneyin."
            );
          },
        });
      });
  });

  const onSubmitReset = resetForm.handleSubmit((values) => {
    reset.mutate({ phone: forgotPhone, ...values });
  });

  const backToLogin = () => {
    if (forgotPhone) {
      form.setValue("phone", forgotPhone);
    }
    setView("login");
    setForgotStep("phone");
    setForgotPhone("");
    setForgotNote(null);
    forgotForm.reset();
    resetForm.reset();
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-canvas-pure p-6 shadow-md sm:p-8">
      {view === "login" ? (
        <>
          <h1 className="font-headline-md text-headline-md font-semibold text-primary">
            Giriş Yap
          </h1>
          <p className="mt-1.5 font-body-md text-body-md text-on-surface-variant">
            Hesabınıza telefon numaranız ve şifrenizle giriş yapın.
          </p>
          <form
            className="mt-6 flex flex-col gap-4"
            noValidate
            onSubmit={onSubmitLogin}
          >
            <div className="flex flex-col gap-1.5">
              <label
                className="font-label-md text-label-md font-semibold text-on-surface"
                htmlFor="phone"
              >
                Telefon Numarası
              </label>
              <PhoneField
                control={form.control}
                errors={form.formState.errors}
                id="phone"
                name="phone"
              />
              <FieldError message={form.formState.errors.phone?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <label
                  className="font-label-md text-label-md font-semibold text-on-surface"
                  htmlFor="password"
                >
                  Şifre
                </label>
                <button
                  className="font-label-sm text-label-sm text-burgundy-light hover:text-primary"
                  onClick={() => {
                    const currentPhone = form.getValues("phone");
                    if (currentPhone) {
                      forgotForm.setValue("phone", currentPhone);
                    }
                    setForgotStep("phone");
                    setForgotNote(null);
                    setView("forgot");
                  }}
                  type="button"
                >
                  Şifremi Unuttum
                </button>
              </div>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className={`${INPUT_CLASS} pr-10`}
                  id="password"
                  placeholder="••••••••"
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
            <FieldError message={form.formState.errors.root?.message} />
            <button
              className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-label-lg text-label-lg font-semibold text-on-primary transition-colors hover:bg-burgundy-light disabled:pointer-events-none disabled:opacity-60"
              disabled={login.isPending}
              type="submit"
            >
              {login.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              Giriş Yap
            </button>
          </form>
          <p className="mt-5 text-center font-body-sm text-body-sm text-on-surface-variant">
            Hesabınız yok mu?{" "}
            <Link
              className="font-semibold text-primary hover:text-burgundy-light"
              href={authHref("/register", redirect)}
            >
              Kayıt Ol
            </Link>
          </p>
        </>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-headline-md text-headline-md font-semibold text-primary">
              Şifremi Unuttum
            </h1>
            <p className="mt-1.5 font-body-md text-body-md text-on-surface-variant">
              Telefon numaranıza 6 haneli sıfırlama kodu gönderilir.
            </p>
          </div>
          {forgotStep === "phone" && (
            <form
              className="flex flex-col gap-4"
              noValidate
              onSubmit={onSubmitForgot}
            >
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-label-md text-label-md font-semibold text-on-surface"
                  htmlFor="forgot-phone"
                >
                  Telefon Numarası
                </label>
                <PhoneField
                  control={forgotForm.control}
                  errors={forgotForm.formState.errors}
                  id="forgot-phone"
                  name="phone"
                />
                <FieldError
                  message={forgotForm.formState.errors.phone?.message}
                />
              </div>
              {forgotNote && (
                <div className="flex items-start gap-2 rounded-xl bg-surface-container-low p-3">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-secondary" />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {forgotNote}
                  </span>
                  {forgotNote.includes("kayıtlı görünmüyor") && (
                    <Link
                      className="ml-auto shrink-0 font-label-sm text-label-sm font-semibold text-primary hover:text-burgundy-light"
                      href={authHref("/register", redirect)}
                    >
                      Kayıt Ol
                    </Link>
                  )}
                </div>
              )}
              <button
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-label-lg text-label-lg font-semibold text-on-primary transition-colors hover:bg-burgundy-light disabled:pointer-events-none disabled:opacity-60"
                disabled={forgot.isPending}
                type="submit"
              >
                {forgot.isPending && (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
                {forgot.isPending ? "Gönderiliyor..." : "Kod Gönder"}
              </button>
            </form>
          )}
          {forgotStep === "reset" && (
            <form
              className="flex flex-col gap-4"
              noValidate
              onSubmit={onSubmitReset}
            >
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Sıfırlama kodu{" "}
                <strong className="text-primary">{forgotPhone}</strong>{" "}
                numarasına gönderildi.
              </p>
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-label-md text-label-md font-semibold text-on-surface"
                  htmlFor="reset-code"
                >
                  Sıfırlama Kodu
                </label>
                <Controller
                  control={resetForm.control}
                  name="code"
                  render={({ field }) => (
                    <input
                      autoComplete="one-time-code"
                      className={`${INPUT_CLASS} h-12 text-center text-lg font-semibold tracking-[0.4em]`}
                      id="reset-code"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="••••••"
                      type="text"
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                    />
                  )}
                />
                <FieldError
                  message={resetForm.formState.errors.code?.message}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-label-md text-label-md font-semibold text-on-surface"
                  htmlFor="reset-password"
                >
                  Yeni Şifre
                </label>
                <input
                  autoComplete="new-password"
                  className={INPUT_CLASS}
                  id="reset-password"
                  placeholder="En az 8 karakter"
                  type="password"
                  aria-invalid={Boolean(resetForm.formState.errors.password)}
                  {...resetForm.register("password")}
                />
                <FieldError
                  message={resetForm.formState.errors.password?.message}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-label-md text-label-md font-semibold text-on-surface"
                  htmlFor="reset-password-confirmation"
                >
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  autoComplete="new-password"
                  className={INPUT_CLASS}
                  id="reset-password-confirmation"
                  placeholder="••••••••"
                  type="password"
                  aria-invalid={Boolean(
                    resetForm.formState.errors.password_confirmation
                  )}
                  {...resetForm.register("password_confirmation")}
                />
                <FieldError
                  message={
                    resetForm.formState.errors.password_confirmation?.message
                  }
                />
              </div>
              <FieldError message={resetForm.formState.errors.root?.message} />
              <button
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-label-lg text-label-lg font-semibold text-on-primary transition-colors hover:bg-burgundy-light disabled:pointer-events-none disabled:opacity-60"
                disabled={reset.isPending}
                type="submit"
              >
                {reset.isPending && (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
                {reset.isPending ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
              </button>
              <button
                className="font-label-sm text-label-sm font-semibold text-burgundy-light hover:text-primary disabled:opacity-60"
                disabled={forgot.isPending}
                onClick={() => forgot.mutate(forgotPhone)}
                type="button"
              >
                {forgot.isPending ? "Gönderiliyor..." : "Kodu yeniden gönder"}
              </button>
            </form>
          )}
          {forgotStep === "done" && (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-surface-container-low px-4 py-6 text-center">
              <CircleCheck className="size-6 text-primary" />
              <p className="font-title-sm text-title-sm font-semibold text-primary">
                Şifreniz güncellendi
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Yeni şifrenizle giriş yapabilirsiniz.
              </p>
            </div>
          )}
          <button
            className="inline-flex items-center justify-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary"
            onClick={backToLogin}
            type="button"
          >
            <ArrowLeft className="size-4" />
            {forgotStep === "reset" ? "Numarayı değiştir" : "Girişe dön"}
          </button>
        </div>
      )}
    </div>
  );
}
