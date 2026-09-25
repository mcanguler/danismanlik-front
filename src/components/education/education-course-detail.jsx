/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  GraduationCap,
  Layers,
  LoaderCircle,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ServicesPageShell } from "@/components/marketing/services-page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatPrice, formatDateTr } from "@/lib/format";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { ROLES } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";
import { useCreateOrder } from "@/lib/orders";
import {
  formatLessonDuration as formatDuration,
  useCourseSectionsQuery,
  usePublicCoursesQuery,
} from "@/lib/courses";

const CARD_CTA_CLASS =
  "inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-burgundy-light shadow-md transition-all";

function resolveCourseFromList(courses, param) {
  const value = String(param ?? "").toLowerCase();
  return (
    courses.find((course) => String(course.slug) === value) ??
    courses.find((course) => String(course.id) === value) ??
    null
  );
}

function LessonRow({ lesson, active, onPlay, playable }) {
  const duration = formatDuration(lesson.duration);
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
        active
          ? "border-primary-container bg-blush-surface"
          : "border-border-delicate bg-canvas-pure hover:bg-surface-container-low"
      )}
      disabled={!playable}
      onClick={onPlay}
      type="button"
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          active ? "bg-primary-container text-on-primary" : "bg-blush-surface text-primary-container"
        )}
      >
        <PlayCircle className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-body-md text-body-md font-medium text-on-surface">
          {lesson.title}
        </span>
        {duration && (
          <span className="block font-label-sm text-label-sm text-on-surface-variant">
            Süre: {duration}
          </span>
        )}
      </span>
    </button>
  );
}

function SectionCard({ section, activeLessonId, onSelectLesson, playable }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-border-delicate bg-canvas-pure">
      <button
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blush-surface text-primary-container">
          <Layers className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-title-sm text-title-sm font-semibold text-primary">
            {section.title}
          </span>
          <span className="block font-label-sm text-label-sm text-on-surface-variant">
            {section.lessonsCount} ders
          </span>
        </span>
        <ChevronRight
          className={cn("size-4 shrink-0 text-on-surface-variant transition-transform", open && "rotate-90")}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-border-delicate p-3">
          {section.lessons.length === 0 ? (
            <p className="py-2 text-center font-label-sm text-label-sm text-on-surface-variant">
              Bu bölümde henüz ders yok
            </p>
          ) : (
            section.lessons.map((lesson) => (
              <LessonRow
                active={activeLessonId === lesson.id}
                key={lesson.id}
                lesson={lesson}
                onPlay={() => onSelectLesson(lesson)}
                playable={playable}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CurriculumPanel({ course }) {
  const sectionsQuery = useCourseSectionsQuery(course.id);
  const sections = sectionsQuery.data ?? [];
  const error = sectionsQuery.error;

  const locked =
    error instanceof ApiError && (error.status === 401 || error.status === 403);

  return (
    <div className="rounded-3xl border border-border-delicate bg-surface-container-low p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-2 font-label-md text-label-md font-semibold uppercase tracking-[0.08em] text-secondary">
        <Layers className="size-4" />
        <span>Eğitim İçeriği</span>
      </div>
      {sectionsQuery.isPending && (
        <div className="flex justify-center py-10">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {locked && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-canvas-pure px-4 py-10 text-center">
          <Lock className="size-7 text-accent-gold" />
          <p className="font-title-sm text-title-sm font-semibold text-primary">
            Müfredat kayıt sonrası açılır
          </p>
          <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
            Bu eğitimin bölüm ve ders içeriklerini görmek için eğitime kayıt
            olmanız gerekiyor. Kaydolduğunuzda tüm içerikler hesabınıza açılır.
          </p>
        </div>
      )}
      {!locked && sectionsQuery.isError && (
        <p className="font-body-md text-body-md text-on-surface-variant">
          Müfredat yüklenemedi. Lütfen tekrar deneyin.
        </p>
      )}
      {!locked && sections.length === 0 && !sectionsQuery.isPending && !sectionsQuery.isError && (
        <p className="font-body-md text-body-md text-on-surface-variant">
          Bu eğitim için henüz yayınlanmış bir içerik yok.
        </p>
      )}
      {!locked && sections.length > 0 && (
        <div className="flex flex-col gap-3">
          {sections.map((section) => (
            <SectionCard
              activeLessonId={null}
              key={section.id}
              onSelectLesson={() => {}}
              playable={false}
              section={section}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PurchasePanel({ course, hasAccess }) {
  const router = useRouter();
  const { status, user } = useAuth();
  const createOrder = useCreateOrder();
  const [dialogOpen, setDialogOpen] = useState(false);

  const price = formatPrice(course.effective_price);
  const originalPrice = course.has_discount ? formatPrice(course.price) : null;
  const isCustomer = user?.role === ROLES.CUSTOMER;

  const handleBuyClick = () => {
    if (status === "unauthenticated") {
      toast.add({
        title: "Giriş gerekli",
        description: "Eğitime kaydolmak için lütfen giriş yapın.",
        type: "info",
      });
      router.push("/login");
      return;
    }
    if (!isCustomer) {
      toast.add({
        title: "Kayıt yapılamaz",
        description: "Eğitime kayıt yalnızca müşteri hesaplarıyla yapılabilir.",
        type: "error",
      });
      return;
    }
    setDialogOpen(true);
  };

  const handleConfirmPurchase = () => {
    createOrder.mutate(
      {
        items: [{ item_type: "COURSE", item_id: course.id }],
      },
      {
        onSuccess: (order) => {
          setDialogOpen(false);
          toast.add({
            title: "Kayıt oluşturuldu",
            description: "Güvenli ödeme ekranına yönlendiriliyorsunuz.",
            type: "info",
          });
          router.push(`/odeme/${order.id}`);
        },
        onError: (error) => {
          toast.add({
            title: "Kayıt oluşturulamadı",
            description: error?.message ?? "Bir sorun oluştu, lütfen tekrar deneyin.",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <div className="rounded-3xl border border-border-delicate bg-canvas-pure p-6 shadow-[0_12px_32px_-4px_rgba(92,29,36,0.06)]">
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
          Eğitim Bedeli
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-headline-lg text-headline-lg font-bold text-primary">
            {price}
          </span>
          {originalPrice && (
            <span className="font-body-md text-body-md text-outline line-through">
              {originalPrice}
            </span>
          )}
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
        <li className="flex items-center gap-2">
          <BadgeCheck className="size-4 shrink-0 text-primary-container" />
          Tüm bölüm ve derslere kayıt sonrası erişim
        </li>
        <li className="flex items-center gap-2">
          <PlayCircle className="size-4 shrink-0 text-primary-container" />
          Web ve mobil üzerinden 7/24 izleme
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0 text-primary-container" />
          PayTR altyapısı ile güvenli ödeme
        </li>
      </ul>
      {hasAccess ? (
        <Button
          className="mt-5 h-12 w-full rounded-full text-base"
          disabled
          type="button"
          variant="outline"
        >
          <CircleCheck className="size-4 text-emerald-600" />
          Bu eğitime erişiminiz var
        </Button>
      ) : (
        <Button
          className="mt-5 h-12 w-full rounded-full text-base"
          disabled={status === "loading" || createOrder.isPending}
          onClick={handleBuyClick}
          type="button"
        >
          {createOrder.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {createOrder.isPending ? "Yönlendiriliyorsunuz..." : "Eğitime Hemen Kaydol"}
        </Button>
      )}
      <p className="mt-3 text-center font-label-sm text-label-sm text-on-surface-variant">
        Kayıt sonrası içerikler anında hesabınıza tanımlanır.
      </p>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eğitime kaydol</DialogTitle>
            <p className="text-sm text-on-surface-variant">
              &quot;{course.title}&quot; eğitimi için {price} tutarında sipariş
              oluşturulacak ve güvenli ödeme ekranına yönlendirileceksiniz.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="h-10"
              onClick={() => setDialogOpen(false)}
              type="button"
              variant="outline"
            >
              Vazgeç
            </Button>
            <Button
              className="h-10"
              disabled={createOrder.isPending}
              onClick={handleConfirmPurchase}
              type="button"
            >
              {createOrder.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {createOrder.isPending ? "Yönlendiriliyorsunuz..." : "Ödemeye Geç"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const FAQS = [
  {
    question: "Eğitime nasıl erişim sağlayabilirim?",
    answer:
      "Kayıt ve ödeme işleminiz tamamlandıktan sonra eğitimin tüm bölümleri ve dersleri hesabınıza tanımlanır. Danışan panelinizdeki \"Eğitimlerim\" sayfasından dilediğiniz zaman izleyebilirsiniz.",
  },
  {
    question: "Videoları kaç kez izleyebilir ve ne kadar süre erişebilirim?",
    answer:
      "Eğitim videolarına web ve mobil üzerinden sınırsız kez erişebilirsiniz. Erişim süresi eğitimin tanımına göre değişir; süreli erişimlerde bitiş tarihi Eğitimlerim sayfanızda görünür.",
  },
  {
    question: "Ödemelerim güvenli mi?",
    answer:
      "Ödemeleriniz PayTR altyapısı ile 256-Bit SSL şifreleme alınır; kart bilgileri sistemimizde saklanmaz.",
  },
  {
    question: "Eğitim içeriğine erişimim yoksa ne yapmalıyım?",
    answer:
      "Kaydınıza rağmen içeriğe erişemiyorsanız WhatsApp destek hattımızdan bize ulaşabilirsiniz; kaydınız kısa sürede kontrol edilip etkinleştirilir.",
  },
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-border-delicate bg-canvas-pure">
      <button
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="font-title-sm text-title-sm font-medium text-primary">
          {question}
        </span>
        <ChevronRight
          className={cn("size-4 shrink-0 text-on-surface-variant transition-transform", open && "rotate-90")}
        />
      </button>
      {open && (
        <p className="border-t border-border-delicate px-5 py-4 font-body-md text-body-md text-on-surface-variant">
          {answer}
        </p>
      )}
    </div>
  );
}

export function EducationCourseDetail({ slug }) {
  const listQuery = usePublicCoursesQuery();
  const courses = listQuery.data ?? [];
  const course = resolveCourseFromList(courses, slug);

  return (
    <ServicesPageShell>
      {listQuery.isPending && (
        <div className="mx-auto w-full max-w-[1320px] px-4 py-20 sm:px-6">
          <div className="flex justify-center">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}

      {listQuery.isSuccess && !course && (
        <div className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-16 text-center">
            <GraduationCap className="size-8 text-accent-gold" />
            <p className="font-title-md text-title-md font-semibold text-primary">
              Eğitim bulunamadı
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Aradığınız eğitim mevcut değil veya kayıta kapatılmış olabilir.
            </p>
            <Link className={cn(CARD_CTA_CLASS, "mt-2")} href="/egitimler">
              Tüm Eğitimleri Görüntüle
            </Link>
          </div>
        </div>
      )}

      {course && (
        <>
          <section className="w-full relative overflow-hidden py-10 lg:py-14 bg-gradient-to-b from-canvas-pure via-blush-surface/30 to-canvas-cream">
            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 relative z-10">
              <nav className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant mb-8">
                <Link className="transition-colors hover:text-primary-container" href="/">
                  Anasayfa
                </Link>
                <ChevronRight className="size-3.5 text-outline-variant" />
                <Link className="transition-colors hover:text-primary-container" href="/egitimler">
                  Eğitimler
                </Link>
                <ChevronRight className="size-3.5 text-outline-variant" />
                <span className="max-w-xs truncate font-semibold text-primary-container">
                  {course.title}
                </span>
              </nav>
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blush-surface px-4 py-1.5 font-label-sm text-label-sm font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
                  <Sparkles className="size-4 text-accent-gold" />
                  <span>Online Eğitim</span>
                </div>
                <h1 className="mb-4 font-headline-lg text-headline-lg font-medium tracking-tight text-primary">
                  {course.title}
                </h1>
                <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                  {course.short_description ||
                    course.seo_description ||
                    "Dönüşüm yolculuğunuz için özel olarak tasarlanmış akademi programı."}
                </p>
                {course.has_discount && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-gold px-4 py-1.5 font-label-sm text-label-sm font-bold text-primary shadow-sm">
                    <Sparkles className="size-3.5" />
                    <span>Kampanyalı Fiyat</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="mx-auto w-full max-w-[1320px] px-4 pb-20 pt-10 sm:px-6">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              <div className="flex flex-col gap-8 lg:col-span-2">
                {course.image && (
                  <div className="overflow-hidden rounded-3xl border border-border-delicate">
                    <img
                      alt={course.title}
                      className="max-h-96 w-full object-cover"
                      loading="lazy"
                      src={course.image}
                    />
                  </div>
                )}

                <CurriculumPanel course={course} />

                {(course.description || course.content) && (
                  <div className="rounded-3xl border border-border-delicate bg-canvas-pure p-6 sm:p-8">
                    <div className="mb-4 flex items-center gap-2 font-label-md text-label-md font-semibold uppercase tracking-[0.08em] text-secondary">
                      <GraduationCap className="size-4" />
                      <span>Eğitim Hakkında</span>
                    </div>
                    {course.short_description && (
                      <p className="mb-4 font-body-lg text-body-lg text-on-surface">
                        {course.short_description}
                      </p>
                    )}
                    <div
                      className="prose prose-sm max-w-none font-body-md text-body-md text-on-surface-variant [&_h2]:text-primary [&_strong]:text-primary"
                      dangerouslySetInnerHTML={{
                        __html: course.description || course.content || "",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="flex flex-col gap-4 lg:sticky lg:top-32">
                  <h1 className="font-headline-md text-headline-md font-semibold leading-snug text-primary">
                    {course.title}
                  </h1>
                  <div className="flex items-center gap-2 rounded-2xl border border-border-delicate bg-canvas-pure px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                    <CalendarCheck className="size-4 shrink-0 text-primary-container" />
                    <span>
                      {course.created_at
                        ? `Yayın tarihi: ${formatDateTr(course.created_at)}`
                        : "Her an erişilebilir online eğitim"}
                    </span>
                  </div>
                  <PurchasePanel course={course} />
                </div>
              </div>
            </div>

            <section className="mt-16">
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-label-md text-label-md font-semibold uppercase tracking-[0.08em] text-secondary">
                  Merak Edilenler
                </p>
                <h2 className="mt-2 font-headline-md text-headline-md font-semibold text-primary">
                  Sıkça Sorulan Sorular
                </h2>
              </div>
              <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3">
                {FAQS.map((faq) => (
                  <FaqItem answer={faq.answer} key={faq.question} question={faq.question} />
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </ServicesPageShell>
  );
}
