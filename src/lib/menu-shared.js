import { api, ApiError } from "./api";

/**
 * Sunucu tarafında da kullanılabilen paylaşılan menü yardımcıları.
 * Bu modül client-only bağımlılık (next/navigation hook'ları) içermemeli;
 * root layout buraya güvenle import edebilir.
 */

export const publicMenusQueryKey = ["public-menus"];

/** Menü slug'ı ayarları üzerinden bulunamazsa header için yedek slug. */
export const HEADER_MENU_SLUG = "ana-menu";

/**
 * Ayarlar üzerinden menü yerleşimi: ayar değeri menü slug'ıdır.
 * Ayar yoksa/boşsa fallbackSlug kullanılır; o da yoksa menü yüklenmez.
 */
export const MENU_SETTING_SOURCES = {
  header: { settingKey: "menu_header", fallbackSlug: HEADER_MENU_SLUG },
  "footer-1": { settingKey: "menu_footer-1", fallbackSlug: null },
  "footer-2": { settingKey: "menu_footer-2", fallbackSlug: null },
  homepage: { settingKey: "menu_homepage", fallbackSlug: null },
};

export function resolveMenuSlug(settings, source) {
  const slug = String(settings?.[source.settingKey] ?? "").trim();
  return slug || source.fallbackSlug || null;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeMenuItem(item) {
  if (!item || typeof item !== "object") return null;
  const children = asArray(item.children)
    .map(normalizeMenuItem)
    .filter(Boolean);
  return {
    ...item,
    title: item.title ?? "",
    url: item.url ?? null,
    target: item.target ?? null,
    sort_order: item.sort_order ?? 0,
    is_active: Boolean(item.is_active),
    parent_id: item.parent_id ?? null,
    page_id: item.page_id ?? null,
    page: item.page && typeof item.page === "object" ? item.page : null,
    children,
  };
}

export function normalizeMenu(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    name: item.name ?? "",
    slug: item.slug ?? "",
    is_active: Boolean(item.is_active),
    items: asArray(item.items).map(normalizeMenuItem).filter(Boolean),
  };
}

/** Backend'in döndürdüğü items ağacını editor'ün kullandığı düz listeye çevirir. */
export function flattenMenuItems(items, parentId = null) {
  const result = [];
  for (const raw of asArray(items)) {
    const item = normalizeMenuItem({ ...raw, parent_id: raw.parent_id ?? parentId });
    if (!item) continue;
    const { children, ...rest } = item;
    result.push(rest);
    if (children.length > 0) {
      result.push(...flattenMenuItems(children, item.id));
    }
  }
  return result;
}

export async function fetchPublicMenu(slug) {
  const menu = normalizeMenu((await api.publicMenu(slug))?.data ?? null);
  if (!menu) throw new ApiError("Beklenmeyen yanıt formatı");
  return menu;
}
