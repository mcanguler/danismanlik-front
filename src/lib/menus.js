import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";
import {
  fetchPublicMenu,
  flattenMenuItems,
  HEADER_MENU_SLUG,
  MENU_SETTING_SOURCES,
  normalizeMenu,
  normalizeMenuDetail,
  normalizeMenuItem,
  publicMenusQueryKey,
  resolveMenuSlug,
} from "./menu-shared";
import { SETTINGS_STALE_TIME, useSettingsQuery } from "./settings";

export const adminMenusQueryKey = ["admin-menus"];

export {
  fetchPublicMenu,
  flattenMenuItems,
  HEADER_MENU_SLUG,
  MENU_SETTING_SOURCES,
  normalizeMenuDetail,
  normalizeMenuItem,
  normalizeMenu,
  publicMenusQueryKey,
  resolveMenuSlug,
};

function useToken() {
  return useAuthStore((state) => state.token);
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
    staleTime: SETTINGS_STALE_TIME,
  });
}

export function usePublicMenuQuery(slug, options = {}) {
  return useQuery({
    queryKey: [...publicMenusQueryKey, "detail", String(slug)],
    queryFn: async () => fetchPublicMenu(slug),
    enabled: (options.enabled ?? true) !== false && Boolean(slug),
    retry: false,
    staleTime: SETTINGS_STALE_TIME,
  });
}

/**
 * Ayarlardaki bir menü key'ine (`menu_header`, `menu_footer-1`,
 * `menu_footer-2`, `menu_homepage`) göre menü öğelerini getirir.
 */
export function useSettingMenuItems(source) {
  const settingsQuery = useSettingsQuery();
  const slug = resolveMenuSlug(settingsQuery.data, source);
  const query = usePublicMenuQuery(slug);

  const items = query.data?.items ?? [];

  return {
    items,
    menuName: query.data?.name ?? null,
    hasItems: items.length > 0,
    isPending: query.isPending,
  };
}

/**
 * Public header menüsü: ayarlardaki `menu_header` key'inin gösterdiği
 * menüyü link modeline çevirir; ayar/menu yoksa veya öğe yoksa statik
 * fallback linkleri döndürür.
 */
export function useHeaderMenuLinks(fallbackLinks) {
  const pathname = usePathname();
  const settingsQuery = useSettingsQuery();
  const query = usePublicMenuQuery(
    resolveMenuSlug(settingsQuery.data, MENU_SETTING_SOURCES.header)
  );

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
