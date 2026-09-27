import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const blogQueryKey = ["blog"];
export const blogCategoriesQueryKey = ["blog-categories"];
export const blogCommentsQueryKey = ["blog-comments"];

function useToken() {
  return useAuthStore((state) => state.token);
}

function normalizeCategory(value) {
  if (!value || typeof value !== "object") return null;
  return {
    ...value,
    name: value.name ?? "",
    slug: value.slug ?? "",
    is_active: value.is_active === undefined ? true : Boolean(value.is_active),
    posts_count: value.posts_count ?? value.blogs_count ?? null,
  };
}

function normalizePost(item) {
  if (!item || typeof item !== "object") return null;
  const category = normalizeCategory(item.category ?? item.blog_category);
  return {
    ...item,
    title: item.title ?? "",
    slug: item.slug ?? String(item.id ?? ""),
    thumbnail: item.thumbnail ?? item.image ?? null,
    short_description: item.short_description ?? item.excerpt ?? "",
    content: item.content ?? "",
    seo_title: item.seo_title ?? "",
    seo_description: item.seo_description ?? "",
    is_active: item.is_active === undefined ? true : Boolean(item.is_active),
    published_at: item.published_at ?? null,
    category,
    category_name: category?.name ?? item.category_name ?? null,
  };
}

function normalizePostList(payload) {
  const data = payload?.data;
  const meta = payload?.meta ?? null;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return {
    items: data.map(normalizePost).filter(Boolean),
    meta: meta
      ? {
          currentPage: meta.current_page ?? 1,
          lastPage: meta.last_page ?? 1,
          perPage: meta.per_page ?? data.length,
          total: meta.total ?? data.length,
        }
      : null,
  };
}

function normalizeCategoryList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeCategory).filter(Boolean);
}

function normalizeComment(item) {
  if (!item || typeof item !== "object") return null;
  const children = Array.isArray(item.children)
    ? item.children
    : Array.isArray(item.replies)
      ? item.replies
      : null;
  return {
    ...item,
    first_name: item.first_name ?? "",
    last_name: item.last_name ?? "",
    name: item.name ?? [item.first_name, item.last_name].filter(Boolean).join(" "),
    content: item.content ?? "",
    is_approved: item.is_approved === undefined ? true : Boolean(item.is_approved),
    parent_id: item.parent_id ?? null,
    children: (children ?? []).map(normalizeComment).filter(Boolean),
  };
}

function normalizeCommentList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeComment).filter(Boolean);
}

function normalizeCommentDetail(payload) {
  const comment = normalizeComment(payload?.data ?? payload);
  if (!comment) throw new ApiError("Beklenmeyen yanıt formatı");
  return comment;
}

export function readingTimeMinutes(content) {
  const words = String(content ?? "")
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* ------------------------------ PUBLIC ------------------------------ */

export function useBlogPostsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: [...blogQueryKey, "public", params],
    queryFn: async () => normalizePostList(await api.blogPosts(params)),
    enabled: options.enabled !== false,
    placeholderData: keepPreviousData,
  });
}

export function useBlogCategoriesQuery(options = {}) {
  return useQuery({
    queryKey: [...blogCategoriesQueryKey, "public"],
    queryFn: async () => normalizeCategoryList(await api.blogCategories()),
    enabled: options.enabled !== false,
  });
}

export function useBlogCommentsQuery(slug, options = {}) {
  return useQuery({
    queryKey: [...blogCommentsQueryKey, "public", String(slug)],
    queryFn: async () => normalizeCommentList(await api.blogComments(slug)),
    enabled: (options.enabled ?? true) !== false && Boolean(slug),
  });
}

export function useCreateBlogComment(slug) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => api.createBlogComment(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...blogCommentsQueryKey, "public", String(slug)],
      });
    },
  });
}

/* ------------------------------- ADMIN ------------------------------ */

export function useAdminBlogPostsQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...blogQueryKey, params],
    queryFn: async () => normalizePostList(await api.adminBlogPosts(token, params)),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

export function useAdminBlogPostQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...blogQueryKey, "detail", String(id)],
    queryFn: async () => {
      const payload = await api.adminBlogPost(token, id);
      return normalizePost(payload?.data ?? payload);
    },
    enabled: (options.enabled ?? true) !== false && Boolean(token && id),
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createBlogPost(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogQueryKey });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateBlogPost(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogQueryKey });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteBlogPost(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogQueryKey });
    },
  });
}

export function useAdminBlogCategoriesQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...blogCategoriesQueryKey, params],
    queryFn: async () =>
      normalizeCategoryList(await api.adminBlogCategories(token, params)),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createBlogCategory(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogCategoriesQueryKey });
      queryClient.invalidateQueries({ queryKey: blogQueryKey });
    },
  });
}

export function useUpdateBlogCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateBlogCategory(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogCategoriesQueryKey });
      queryClient.invalidateQueries({ queryKey: blogQueryKey });
    },
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteBlogCategory(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogCategoriesQueryKey });
      queryClient.invalidateQueries({ queryKey: blogQueryKey });
    },
  });
}

export function useAdminBlogCommentsQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...blogCommentsQueryKey, params],
    queryFn: async () =>
      normalizeCommentList(await api.adminBlogComments(token, params)),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

export function useAdminBlogCommentQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...blogCommentsQueryKey, "detail", String(id)],
    queryFn: async () => {
      const payload = await api.adminBlogComment(token, id);
      return normalizeCommentDetail(payload);
    },
    enabled: (options.enabled ?? true) !== false && Boolean(token && id),
    retry: false,
  });
}

export function useBlogCommentApproval() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, isApproved }) =>
      api.updateBlogCommentApproval(token, id, { is_approved: isApproved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogCommentsQueryKey });
    },
  });
}

export function useDeleteBlogComment() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteBlogComment(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogCommentsQueryKey });
    },
  });
}
