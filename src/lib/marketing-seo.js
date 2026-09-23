import { api } from "./api";

function unwrapList(payload) {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : [];
}

async function fetchList(request) {
  try {
    return unwrapList(await request());
  } catch {
    return [];
  }
}

export function fetchPublicServiceCategories() {
  return fetchList(() => api.serviceCategories(null));
}

export function fetchPublicServices() {
  return fetchList(() => api.services(null));
}

export function findPublicItem(items, key) {
  return (
    items.find(
      (item) =>
        item.is_active &&
        (item.slug === key || String(item.id) === String(key))
    ) ?? null
  );
}

export function cleanMetaText(value) {
  return typeof value === "string" ? value.trim() : "";
}
