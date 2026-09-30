import { api, ApiError } from "./api";

const GUEST_CART_KEY = "danismanlik.cart.guest";

function readItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === "object");
  } catch {
    return [];
  }
}

function writeItems(items) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    void 0;
  }
}

let idCounter = 0;

const GUEST_ID_PREFIX = "guest-";

export function isGuestCartId(id) {
  return typeof id === "string" && id.startsWith(GUEST_ID_PREFIX);
}

function createGuestId() {
  idCounter += 1;
  return `${GUEST_ID_PREFIX}${Date.now().toString(36)}-${idCounter}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function identityKey(item) {
  return JSON.stringify([
    item.product_id ?? null,
    item.variation_id ?? null,
    item.item_type ?? "PRODUCT",
    item.item_id ?? null,
    item.selected_options ?? null,
  ]);
}

export function guestCartMeta(items) {
  const count = items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.total ?? 0),
    0
  );
  return { count, subtotal, discount: 0, total: subtotal, coupon: null };
}

export function readGuestCart() {
  const items = readItems();
  return { items, meta: guestCartMeta(items) };
}

export function hasGuestCartItems() {
  return readItems().length > 0;
}

export function addGuestCartItem(payload, snapshot = {}) {
  const items = readItems();
  const quantity = Math.max(1, Number(payload.quantity ?? 1));
  const key = identityKey(payload);
  const existing = items.find((item) => item.__key === key);
  if (existing) {
    existing.quantity = Number(existing.quantity ?? 1) + quantity;
    existing.total = Number(existing.unit_price ?? 0) * existing.quantity;
    writeItems(items);
    return existing;
  }
  const unitPrice = Number(snapshot.unitPrice ?? 0);
  const item = {
    id: createGuestId(),
    __key: key,
    item_type: payload.item_type ?? "PRODUCT",
    quantity,
    unit_price: unitPrice,
    total: unitPrice * quantity,
    product_id: payload.product_id ?? null,
    variation_id: payload.variation_id ?? null,
    item_id: payload.item_id ?? null,
    selected_options: payload.selected_options ?? null,
    product: snapshot.product ?? null,
    variation: snapshot.variation ?? null,
    item: snapshot.item ?? null,
  };
  items.push(item);
  writeItems(items);
  return item;
}

export function updateGuestCartItem(id, quantity) {
  const items = readItems();
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  // Ürün dışındaki öğelerde (eğitim, paket, randevu) adet sunucuda sabit 1'dir.
  const isProduct = item.product_id != null;
  item.quantity = isProduct ? Math.max(1, Number(quantity ?? 1)) : 1;
  item.total = Number(item.unit_price ?? 0) * item.quantity;
  writeItems(items);
}

export function removeGuestCartItem(id) {
  writeItems(readItems().filter((item) => item.id !== id));
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_CART_KEY);
}

function buildMergePayload(item) {
  if (item.product_id != null) {
    return {
      product_id: item.product_id,
      quantity: item.quantity,
      ...(item.variation_id != null
        ? { variation_id: item.variation_id }
        : {}),
      ...(item.selected_options
        ? { selected_options: item.selected_options }
        : {}),
    };
  }
  return {
    item_type: item.item_type ?? "COURSE",
    item_id: item.item_id,
    quantity: Math.max(1, Number(item.quantity ?? 1)),
  };
}

async function mergeGuestCart(token) {
  const items = readItems();
  if (!token || items.length === 0) return { merged: 0, failed: 0, dropped: 0 };
  let merged = 0;
  let dropped = 0;
  const failedItems = [];
  for (const item of items) {
    try {
      await api.createCartItem(token, buildMergePayload(item));
      merged += 1;
    } catch (error) {
      // Kalıcı hatalar (stokta yok, ürün kaldırılmış, 4xx doğrulama)
      // öğeyi sonsuza dek sepeti tıkamasın diye düşürülür; geçici
      // hatalar sonraki oturumda yeniden denenmek üzere saklanır.
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        dropped += 1;
      } else {
        failedItems.push(item);
      }
    }
  }
  writeItems(failedItems);
  return { merged, failed: failedItems.length, dropped };
}

let mergeInFlight = null;

export function mergeGuestCartToServer(token) {
  if (mergeInFlight) return mergeInFlight;
  mergeInFlight = mergeGuestCart(token).finally(() => {
    mergeInFlight = null;
  });
  return mergeInFlight;
}
