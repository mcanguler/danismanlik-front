/**
 * Menü item'larının bağlanabileceği link kaynakları.
 * URL patternleri mevcut public route'lardan alınmıştır (tahmini değil):
 *
 * - CMS Sayfası          → /{page.slug}              (src/app/[slug]/page.js)
 * - Hizmet Kategorisi    → /hizmetler/{slug}          (src/app/hizmetler/[slug])
 * - Hizmet               → /hizmetler/{categorySlug}/{serviceSlug}
 *                                                      (src/app/hizmetler/[slug]/[service])
 * - Ürün Kategorisi      → /urunler?category_id={id}  (src/app/urunler — kategori filtresi)
 * - Ürün                 → /urunler/{slug}            (src/app/urunler/[slug])
 * - Kurs                 → /egitimler/{slug}          (src/app/egitimler/[slug])
 * - Hizmet Paketi        → /paketler/{slug}           (src/app/paketler/[slug])
 * - Harici / Manuel URL  → admin'in girdiği url
 */

export const MENU_LINK_SOURCES = {
  PAGE: "PAGE",
  SERVICE_CATEGORY: "SERVICE_CATEGORY",
  SERVICE: "SERVICE",
  PRODUCT_CATEGORY: "PRODUCT_CATEGORY",
  PRODUCT: "PRODUCT",
  COURSE: "COURSE",
  SERVICE_PACKAGE: "SERVICE_PACKAGE",
  MANUAL: "MANUAL",
};

export const MENU_LINK_SOURCE_LABELS = {
  [MENU_LINK_SOURCES.PAGE]: "CMS Sayfası",
  [MENU_LINK_SOURCES.SERVICE_CATEGORY]: "Hizmet Kategorisi",
  [MENU_LINK_SOURCES.SERVICE]: "Hizmet",
  [MENU_LINK_SOURCES.PRODUCT_CATEGORY]: "Ürün Kategorisi",
  [MENU_LINK_SOURCES.PRODUCT]: "Ürün",
  [MENU_LINK_SOURCES.COURSE]: "Kurs",
  [MENU_LINK_SOURCES.SERVICE_PACKAGE]: "Hizmet Paketi",
  [MENU_LINK_SOURCES.MANUAL]: "Harici / Manuel URL",
};

export const MENU_TARGETS = {
  SELF: "_self",
  BLANK: "_blank",
};

export const MENU_TARGET_LABELS = {
  [MENU_TARGETS.SELF]: "Aynı Sekme (_self)",
  [MENU_TARGETS.BLANK]: "Yeni Sekme (_blank)",
};

/**
 * Bir menü item'ının backend verisinden public URL'ini çözümler.
 * page_id doluysa CMS sayfası (/{page.slug}); değilse item.url kullanılır.
 */
export function resolveMenuItemHref(item) {
  if (!item) return "#";
  if (item.page?.slug) return `/${item.page.slug}`;
  return item.url ?? "#";
}
