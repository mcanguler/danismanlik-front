import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const adminMenusQueryKey = ["admin-menus"];
export const publicMenusQueryKey = ["public-menus"];

/** Menü slug'ı site header'ında kullanılır. */
export const HEADER_MENU_SLUG = "ana-menu";

function useToken() {
  return useAuthStore((state) => state.token);
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

function normalizeMenuDetail(payload) {
  const menu = normalizeMenu(payload?.data ?? payload);
  if (!menu) throw new ApiError("Beklenmeyen yanıt formatı");
  return menu;
}

function normalizeMenuItemList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeMenuItem).filter(Boolean);
}

export function useAdminMenusQuery(options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...adminMenusQueryKey],
    queryFn: async () => {
      const payload = await api.adminMenus(token);
      const data = payload?.data ?? payload;
      if (!Array.isArray(data)) {
        throw new ApiError("Beklenmeyen yanıt formatı");
      }
      return data.map(normalizeMenu).filter(Boolean);
    },
    enabled: options.enabled !== false && Boolean(token),
  });
}

export function useAdminMenuQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...adminMenusQueryKey, "detail", String(id)],
    queryFn: async () => normalizeMenuDetail(await api.adminMenu(token, id)),
    enabled: (options.enabled ?? true) !== false && Boolean(token && id),
    retry: false,
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async (payload) =>
      normalizeMenuDetail(await api.createMenu(token, payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMenusQueryKey });
      queryClient.invalidateQueries({ queryKey: publicMenusQueryKey });
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async ({ id, payload }) =>
      normalizeMenuDetail(await api.updateMenu(token, id, payload)),
    onSuccess: (menu, { id, oldSlug }) => {
      queryClient.setQueryData(
        [...adminMenusQueryKey, "detail", String(id)],
        menu
      );
      queryClient.setQueryData(adminMenusQueryKey, (old) =>
        Array.isArray(old)
          ? old.map((item) =>
              String(item.id) === String(menu.id) ? menu : item
            )
          : old
      );
      if (oldSlug && menu.slug && oldSlug !== menu.slug) {
        queryClient.removeQueries({
          queryKey: [...publicMenusQueryKey, "detail", oldSlug],
        });
      }
      queryClient.invalidateQueries({ queryKey: publicMenusQueryKey });
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteMenu(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMenusQueryKey });
      queryClient.invalidateQueries({ queryKey: publicMenusQueryKey });
    },
  });
}

export function useCreateMenuItem(menuId) {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createMenuItem(token, menuId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMenusQueryKey });
      queryClient.invalidateQueries({ queryKey: publicMenusQueryKey });
    },
  });
}

export function useUpdateMenuItem(menuId) {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateMenuItem(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMenusQueryKey });
      queryClient.invalidateQueries({ queryKey: publicMenusQueryKey });
    },
  });
}

export function useDeleteMenuItem(menuId) {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteMenuItem(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMenusQueryKey });
      queryClient.invalidateQueries({ queryKey: publicMenusQueryKey });
    },
  });
}

export function usePublicMenusQuery(options = {}) {
  return useQuery({
    queryKey: [...publicMenusQueryKey],
    queryFn: async () => {
      const payload = await api.publicMenus();
      const data = payload?.data ?? payload;
      if (!Array.isArray(data)) {
        throw new ApiError("Beklenmeyen yanıt formatı");
      }
      return data.map(normalizeMenu).filter(Boolean);
    },
    enabled: options.enabled !== false,
  });
}

export function usePublicMenuQuery(slug, options = {}) {
  return useQuery({
    queryKey: [...publicMenusQueryKey, "detail", String(slug)],
    queryFn: async () =>
      normalizeMenuDetail(await api.publicMenu(slug)),
    enabled: (options.enabled ?? true) !== false && Boolean(slug),
    retry: false,
  });
}

/**
 * Public header menüsü: `header-main` slug'lı menü varsa ağacı link modeline
 * çevirir; yoksa/erişilemezse statik fallback linkleri döndürür.
 */
export function useHeaderMenuLinks(fallbackLinks) {
  const pathname = usePathname();
  const query = usePublicMenuQuery(HEADER_MENU_SLUG);

  const links = useMemo(() => {
    const items = query.data?.items ?? [];
    if (items.length === 0) return fallbackLinks;

    const mapItem = (item) => ({
      label: item.title,
      href: item.url ?? "#",
      target: item.target && item.target !== "_self" ? item.target : undefined,
      active:
        item.url === "/"
          ? pathname === "/"
          : Boolean(item.url && pathname?.startsWith(item.url)),
      children: (item.children ?? []).map(mapItem),
    });

    return items.map(mapItem);
  }, [query.data, fallbackLinks, pathname]);

  return {
    links,
    isFromMenu: (query.data?.items?.length ?? 0) > 0,
    isLoading: query.isPending,
  };
}
