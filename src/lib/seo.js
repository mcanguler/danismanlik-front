import { fetchSettingsMap } from "./settings";

/**
 * Yönetim panelinde oluşturulacak SEO ayar anahtarları.
 * Değerler boş bırakılırsa sayfa bazlı statik varsayılanlar kullanılır.
 */
export const SEO_SETTING_KEYS = {
  siteTitle: "seo_site_title",
  siteDescription: "seo_site_description",
  defaultKeywords: "seo_default_keywords",
  ogImage: "seo_og_image",
  homeTitle: "seo_home_title",
  homeDescription: "seo_home_description",
  productsTitle: "seo_products_title",
  productsDescription: "seo_products_description",
  productsKeywords: "seo_products_keywords",
  coursesTitle: "seo_courses_title",
  coursesDescription: "seo_courses_description",
  servicesTitle: "seo_services_title",
  servicesDescription: "seo_services_description",
  packagesTitle: "seo_packages_title",
  packagesDescription: "seo_packages_description",
  blogTitle: "seo_blog_title",
  blogDescription: "seo_blog_description",
  contactTitle: "seo_contact_title",
  contactDescription: "seo_contact_description",
  consultantsTitle: "seo_consultants_title",
  consultantsDescription: "seo_consultants_description",
  testimonialsTitle: "seo_testimonials_title",
  testimonialsDescription: "seo_testimonials_description",
};

const FALLBACK_SITE_NAME = "Sümeyra Aydın Akademi & Danışmanlık";
const SEO_CACHE_TTL = 60 * 1000;

let seoCache = null;
let seoCacheAt = 0;

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
}

/** SEO ayarlarını okur (istek başına bir kez, kısa süreli önbellekle). */
export async function getSeoSettings() {
  if (seoCache && Date.now() - seoCacheAt < SEO_CACHE_TTL) {
    return seoCache;
  }
  let settings = {};
  try {
    settings = (await fetchSettingsMap()) ?? {};
  } catch {
    settings = {};
  }
  const read = (key) => String(settings[key] ?? "").trim();
  const seo = {};
  for (const [name, key] of Object.entries(SEO_SETTING_KEYS)) {
    seo[name] = read(key);
  }
  seo.siteTitle = seo.siteTitle || FALLBACK_SITE_NAME;
  seoCache = seo;
  seoCacheAt = Date.now();
  return seo;
}

function resolveTitle(rawTitle, siteName) {
  if (!rawTitle) return siteName;
  return rawTitle.includes(siteName) ? rawTitle : `${rawTitle} | ${siteName}`;
}

/**
 * Next.js Metadata nesnesi üretir. `title`/`description` verilmezse
 * ayarlardaki site geneli değerlerle doldurulur.
 */
export async function buildMetadata({
  title,
  description,
  keywords,
  image,
  path,
  type = "website",
} = {}) {
  const seo = await getSeoSettings();
  const resolvedTitle = resolveTitle(title, seo.siteTitle);
  const resolvedDescription = description || seo.siteDescription || undefined;
  const resolvedKeywords =
    [keywords, seo.defaultKeywords].filter(Boolean).join(", ") || undefined;
  const resolvedImage = image || seo.ogImage || undefined;
  const base = siteUrl();
  const url = path && base ? `${base}${path}` : undefined;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: resolvedKeywords,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      siteName: seo.siteTitle,
      type,
      locale: "tr_TR",
      images: resolvedImage ? [resolvedImage] : undefined,
    },
    twitter: {
      card: resolvedImage ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}
