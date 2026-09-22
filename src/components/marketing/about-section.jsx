import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Calendar, HeartHandshake } from "lucide-react";

const PORTRAIT_URL =
  "https://lh3.googleusercontent.com/aida/AEtjO1UFAMOY_ewo7jW-WMwSPz5eZIPPOSSgCbfO14DPB9ypJ25OQo0TnmLrGZWZXMus98TnxTmg2ZlATVYRqR502IkluTHWoPN8qUqHqu-l2Tr-6fecYZHNHqTGNqJFAjXMGNxMUmklEzdxTaPsGMH1K9YyoP1MhxD6SuWxi06QQQKLhcQLV5CazuzZhFukLf1ES6TutiXerNe_Lq2i7SRPb8cNhrrncWpkTgk_6AUIALN1KvSY86kTHXJyRQ";

const STATS = [
  { value: "15.000+", label: "Danışan & Öğrenci" },
  { value: "5+", label: "Yayınlanmış E-Kitap" },
  { value: "%98", label: "Memnuniyet Oranı" },
];

export function AboutSection() {
  return (
    <section
      className="w-full bg-canvas-pure py-20 border-t border-surface-container"
      id="hakkimda"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-[36px] overflow-hidden bg-blush-surface shadow-2xl p-2.5">
              <div className="relative w-full h-full rounded-[28px] overflow-hidden">
                <Image
                  alt="Sümeyra Aydın Biyografi"
                  className="w-full h-full object-cover object-center"
                  fill
                  sizes="(min-width: 1024px) 400px, 100vw"
                  src={PORTRAIT_URL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
              </div>
            </div>
            <div className="absolute -bottom-4 right-4 bg-canvas-pure/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-border-delicate">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <Award className="size-5" />
              </div>
              <div>
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Akredite Danışman
                </div>
                <div className="font-title-md text-title-md text-primary font-bold">
                  8+ Yıllık Tecrübe
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush-surface text-primary-container font-label-sm text-label-sm uppercase tracking-wider">
              <HeartHandshake className="size-4" />
              <span>Biyografi &amp; Vizyon</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary font-medium tracking-tight">
              Sümeyra Aydın Kimdir?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
              İlişki ve Aile Danışmanı, Yazar ve Eğitmen Sümeyra Aydın; modern
              psikoloji dinamikleri ile kadim dişil bilgelik öğretilerini
              sentezleyerek bireylerin ve çiftlerin ilişkilerinde köklü bir
              dönüşüm gerçekleştirmelerine rehberlik etmektedir.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Binlerce kadına ulaşan çok satan e-kitapları, masterclass
              programları ve birebir seanslarıyla kadınların kendi öz değerini
              hatırlamalarını, sınırlarını zarafetle çizmelerini ve
              tükenmişlik hissi yaşamadan derin bağlar inşa etmelerini sağlar.
            </p>
            <div className="grid grid-cols-3 gap-6 w-full pt-4 pb-2 border-y border-surface-container">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="font-headline-sm text-headline-sm font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-lg hover:bg-burgundy-light transition-all"
                href="#hakkimda"
              >
                <span>Biyografiyi Oku</span>
                <ArrowRight className="size-[18px]" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-blush-surface text-primary-container font-label-lg text-label-lg hover:bg-blush-hover transition-colors"
                href="/dashboard/randevu-al"
              >
                <Calendar className="size-[18px]" />
                <span>Randevu Planla</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}