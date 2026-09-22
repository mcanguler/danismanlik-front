import {
  CircleCheck,
  Handshake,
  Infinity as InfinityIcon,
  Mic,
  RefreshCw,
  Send,
  User,
  Users,
  Video,
  ChartBar,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";

export function SessionsSection() {
  return (
    <section
      className="max-w-[1320px] mx-auto px-4 sm:px-6 py-20 w-full"
      id="seanslar"
    >
      <SectionHeading
        align="center"
        description="Güvenli, şefkatli ve gizlilik odaklı bir ortamda Sümeyra Aydın ile doğrudan çalışarak ilişkinizdeki düğümleri çözün."
        eyebrow="Birebir Rehberlik"
        title="1e1 Seanslar & Dönüşüm Danışmanlığı"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <PricingCard
          cta="Randevu Seç"
          description="Kişisel tıkanıklıklar, ilişki kaygıları ve dişil blokajların tespiti için 1e1 derin analiz."
          features={[
            { icon: Video, label: "Canlı Online Görüşme (Zoom / Google Meet)" },
            { icon: ChartBar, label: "Bireysel İlişki Döngüsü Analizi" },
            { icon: CircleCheck, label: "Seans Sonu Kişiselleştirilmiş Eylem Planı" },
          ]}
          icon={User}
          price="1.750 TL"
          period="/ 50 Dakika"
          title="Görüntülü Bireysel Seans"
        />
        <PricingCard
          cta="Paketi Seç & Randevu Al"
          description="Kalıcı davranış değişikliği, düzenli takip ve süreç boyunca sürdürülebilir rehberlik."
          features={[
            { icon: CircleCheck, label: "3 x 50 Dk Birebir Canlı Seans", strong: true },
            { icon: CircleCheck, label: "Seanslar Arası WhatsApp Takip Desteği", strong: true },
            { icon: CircleCheck, label: "1 Adet E-Kitap Hediyesi (İstediğiniz kitap)" },
            { icon: CircleCheck, label: "Özel Meditasyon & Bilinçaltı Egzersizleri" },
          ]}
          highlight
          icon={InfinityIcon}
          oldPrice="5.250 TL"
          price="4.500 TL"
          period="/ 3 x 50 Dakika"
          title="3 Seanslık Dönüşüm Paketi"
        />
        <PricingCard
          cta="Randevu Seç"
          description="Partnerinizle birlikte iletişim krizlerini aşmak ve evlilikteki bağı tazelemek için."
          features={[
            { icon: Users, label: "Çift Olarak Ortak Katılımlı Canlı Seans" },
            { icon: RefreshCw, label: "Eril-Dişil Kutuplaşma Analizi" },
            { icon: Handshake, label: "Ortak Çözüm & İletişim Protokolü" },
          ]}
          icon={Users}
          price="2.400 TL"
          period="/ 75 Dakika"
          title="Çift & Aile Danışmanlığı"
        />
      </div>
      <div
        className="mt-12 rounded-2xl bg-blush-surface p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
        id="soru-danismanligi"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-canvas-pure text-primary-container flex items-center justify-center shrink-0 shadow-sm">
            <Mic className="size-6" />
          </div>
          <div>
            <h4 className="font-title-md text-title-md text-primary font-semibold">
              Vaktiniz kısıtlı mı? Sesli Soru Danışmanlığı
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              İlişkinizle ilgili aklınıza takılan soruyu iletin, Sümeyra
              Aydın&apos;dan 24 saat içinde kişiye özel 5-7 dakikalık detaylı
              sesli analiz yanıtı alın.
            </p>
          </div>
        </div>
        <a
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md whitespace-nowrap hover:bg-burgundy-light transition-colors shadow-sm"
          href="#"
        >
          <span>Soru Gönder (490 TL)</span>
          <Send className="size-[18px]" />
        </a>
      </div>
    </section>
  );
}

function PricingCard({
  cta,
  description,
  features,
  highlight = false,
  icon: Icon,
  oldPrice,
  price,
  period,
  title,
}) {
  return (
    <div
      className={
        highlight
          ? "relative flex flex-col justify-between rounded-3xl bg-canvas-pure p-8 shadow-2xl transform lg:-translate-y-4"
          : "flex flex-col justify-between rounded-3xl bg-canvas-pure p-8 shadow-sm hover:shadow-xl transition-all"
      }
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent-gold text-tertiary font-label-sm text-label-sm font-bold uppercase tracking-wider shadow-md">
          En Çok Tercih Edilen
        </div>
      )}
      <div>
        <div
          className={
            highlight
              ? "w-12 h-12 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center mb-6"
              : "w-12 h-12 rounded-2xl bg-blush-surface text-primary-container flex items-center justify-center mb-6"
          }
        >
          <Icon className="size-6" />
        </div>
        <h3 className="font-title-lg text-title-lg text-primary font-semibold mb-2">
          {title}
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
          {description}
        </p>
        <div className="mb-6">
          {oldPrice && (
            <span className="block font-body-sm text-body-sm line-through text-outline">
              {oldPrice}
            </span>
          )}
          <span
            className={
              highlight
                ? "font-headline-md text-headline-md font-bold text-primary-container"
                : "font-headline-md text-headline-md font-bold text-primary"
            }
          >
            {price}
          </span>{" "}
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {period}
          </span>
        </div>
        <ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant mb-8">
          {features.map((feature) => (
            <li key={feature.label} className="flex items-center gap-2.5">
              <feature.icon className="size-[18px] text-accent-gold shrink-0" />
              <span className={feature.strong ? "font-semibold text-primary" : ""}>
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <button
        className={
          highlight
            ? "w-full py-4 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-lg hover:bg-burgundy-light transition-all"
            : "w-full py-3.5 rounded-full bg-canvas-cream text-primary font-label-md text-label-md hover:bg-blush-surface transition-colors shadow-sm"
        }
        type="button"
      >
        {cta}
      </button>
    </div>
  );
}