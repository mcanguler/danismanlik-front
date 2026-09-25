import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";
import { normalizeOrderDetail, ordersQueryKey } from "./orders";

export const productsQueryKey = ["products"];
export const productCategoriesQueryKey = ["product-categories"];
export const cartQueryKey = ["cart"];

export const PRODUCT_TYPES = {
  PHYSICAL: "PHYSICAL",
  DIGITAL: "DIGITAL",
};

export const PRODUCT_TYPE_LABELS = {
  [PRODUCT_TYPES.PHYSICAL]: "Fiziksel Ürün",
  [PRODUCT_TYPES.DIGITAL]: "Dijital Ürün",
};

export const PRODUCT_FIELD_TYPES = {
  INPUT: "INPUT",
  SELECT: "SELECT",
  RADIO: "RADIO",
  CHECKBOX: "CHECKBOX",
};

export const PRODUCT_FIELD_TYPE_LABELS = {
  [PRODUCT_FIELD_TYPES.INPUT]: "Metin Girişi",
  [PRODUCT_FIELD_TYPES.SELECT]: "Seçim Listesi",
  [PRODUCT_FIELD_TYPES.RADIO]: "Radyo Buton",
  [PRODUCT_FIELD_TYPES.CHECKBOX]: "Onay Kutusu",
};

const OPTION_BASED_FIELD_TYPES = [
  PRODUCT_FIELD_TYPES.SELECT,
  PRODUCT_FIELD_TYPES.RADIO,
  PRODUCT_FIELD_TYPES.CHECKBOX,
];

export function isOptionBasedFieldType(type) {
  return OPTION_BASED_FIELD_TYPES.includes(type);
}

function useToken() {
  return useAuthStore((state) => state.token);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeProductFieldOption(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    label: item.label ?? "",
    sort_order: item.sort_order ?? 0,
  };
}

export function normalizeProductField(item) {
  if (!item || typeof item !== "object") return null;
  const options = asArray(item.options)
    .map(normalizeProductFieldOption)
    .filter(Boolean);
  return {
    ...item,
    name: item.name ?? "",
    key: item.key ?? "",
    type: item.type ?? PRODUCT_FIELD_TYPES.INPUT,
    is_required: Boolean(item.is_required),
    sort_order: item.sort_order ?? 0,
    options,
  };
}

export function normalizeProductImage(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    image: item.image ?? "",
    sort_order: item.sort_order ?? 0,
  };
}

export function normalizeProductVariation(item) {
  if (!item || typeof item !== "object") return null;
  const options = asArray(item.options).filter(
    (option) => option && typeof option === "object"
  );
  const sortedOptions = [...options].sort((a, b) =>
    String(a.label ?? "").localeCompare(String(b.label ?? ""), "tr")
  );
  return {
    ...item,
    sku: item.sku ?? "",
    price: item.price ?? null,
    discount_price: item.discount_price ?? null,
    effective_price: item.effective_price ?? null,
    has_discount: Boolean(item.has_discount),
    stock: item.stock ?? 0,
    is_active: Boolean(item.is_active),
    sort_order: item.sort_order ?? 0,
    options: sortedOptions,
  };
}

export function normalizeProductDownload(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    title: item.title ?? "",
    sort_order: item.sort_order ?? 0,
    is_active: Boolean(item.is_active),
  };
}

export function normalizeProductCategory(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    name: item.name ?? "",
    slug: item.slug ?? "",
    image: item.image ?? "",
    seo_title: item.seo_title ?? "",
    seo_description: item.seo_description ?? "",
    is_active: Boolean(item.is_active),
    sort_order: item.sort_order ?? 0,
  };
}

export function normalizeProduct(item) {
  if (!item || typeof item !== "object") return null;
  const gallery = asArray(item.gallery)
    .map(normalizeProductImage)
    .filter(Boolean);
  const fields = asArray(item.fields)
    .map(normalizeProductField)
    .filter(Boolean);
  const variations = asArray(item.variations)
    .map(normalizeProductVariation)
    .filter(Boolean);
  const downloads = asArray(item.downloads)
    .map(normalizeProductDownload)
    .filter(Boolean);
  return {
    ...item,
    type: item.type ?? PRODUCT_TYPES.PHYSICAL,
    title: item.title ?? "",
    slug: item.slug ?? "",
    description: item.description ?? "",
    content: item.content ?? "",
    thumbnail: item.thumbnail ?? "",
    price: item.price ?? null,
    discount_price: item.discount_price ?? null,
    effective_price: item.effective_price ?? null,
    has_discount: Boolean(item.has_discount),
    stock: item.stock ?? 0,
    seo_title: item.seo_title ?? "",
    seo_description: item.seo_description ?? "",
    is_active: Boolean(item.is_active),
    product_category_id: item.product_category_id ?? null,
    category:
      item.category && typeof item.category === "object"
        ? {
            id: item.category.id,
            name: item.category.name ?? "",
            slug: item.category.slug ?? "",
          }
        : null,
    gallery,
    fields,
    variations,
    downloads,
    isDigital: item.type === PRODUCT_TYPES.DIGITAL,
    optionBasedFields: fields.filter((field) =>
      isOptionBasedFieldType(field.type)
    ),
  };
}

export function normalizeProductDetail(payload) {
  const product = normalizeProduct(payload?.data ?? payload);
  if (!product) throw new ApiError("Beklenmeyen yanıt formatı");
  return product;
}

function normalizePaginated(payload, normalizeItem) {
  const data = payload?.data;
  const meta = payload?.meta ?? null;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return {
    items: data.map(normalizeItem).filter(Boolean),
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

function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeProductDetail).filter(Boolean);
}

export function productDetailQueryKey(id) {
  return [...productsQueryKey, "detail", String(id)];
}

export function useAdminProductsQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...productsQueryKey, "list", params],
    queryFn: async () =>
      normalizePaginated(await api.adminProducts(token, params), normalizeProduct),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

export function useAdminProductQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: productDetailQueryKey(id),
    queryFn: async () =>
      normalizeProductDetail(await api.adminProduct(token, id)),
    enabled: options.enabled !== false && Boolean(token && id),
    retry: false,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async (payload) =>
      normalizeProductDetail(await api.createProduct(token, payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateProduct(token, id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
      queryClient.invalidateQueries({ queryKey: productDetailQueryKey(id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteProduct(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useAddProductGalleryImage(productId) {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (formData) =>
      api.addProductGalleryImage(token, productId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useUpdateProductGalleryImage() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateProductGalleryImage(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useDeleteProductGalleryImage() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteProductGalleryImage(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useCreateProductField(productId) {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) =>
      api.createProductField(token, productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useUpdateProductField() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateProductField(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useDeleteProductField() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteProductField(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useCreateProductFieldOption(fieldId) {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) =>
      api.createProductFieldOption(token, fieldId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useUpdateProductFieldOption() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateProductFieldOption(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useDeleteProductFieldOption() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteProductFieldOption(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useProductVariationsQuery(productId, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...productsQueryKey, "variations", String(productId)],
    queryFn: async () =>
      normalizeList(await api.productVariations(token, productId)),
    enabled: options.enabled !== false && Boolean(token && productId),
  });
}

export function useCreateProductVariation(productId) {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) =>
      api.createProductVariation(token, productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useUpdateProductVariation() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateProductVariation(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useDeleteProductVariation() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteProductVariation(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useProductDownloadsQuery(productId, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...productsQueryKey, "downloads", String(productId)],
    queryFn: async () =>
      normalizeList(await api.productDownloads(token, productId)),
    enabled: options.enabled !== false && Boolean(token && productId),
  });
}

export function useAddProductDownload(productId) {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ formData, onProgress }) =>
      api.uploadProductDownload(token, productId, formData, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useUpdateProductDownload() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateProductDownload(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useDeleteProductDownload() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteProductDownload(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function variationOptionIds(variation) {
  return asArray(variation?.options)
    .map((option) => option.id)
    .sort((a, b) => a - b)
    .join(",");
}

export function variationOptionsLabel(variation) {
  const labels = asArray(variation?.options)
    .map((option) => option.label)
    .filter(Boolean);
  return labels.length > 0 ? labels.join(" / ") : "—";
}

function normalizeCategoryList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeProductCategory).filter(Boolean);
}

export function useProductCategoriesQuery(filters = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...productCategoriesQueryKey, filters],
    queryFn: async () =>
      normalizeCategoryList(await api.productCategories(token, filters)),
    enabled: options.enabled !== false && Boolean(token),
  });
}

export function usePublicProductCategoriesQuery(filters = {}, options = {}) {
  return useQuery({
    queryKey: [...productCategoriesQueryKey, "public", filters],
    queryFn: async () =>
      normalizeCategoryList(await api.productCategories(null, filters)),
    enabled: options.enabled !== false,
  });
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createProductCategory(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCategoriesQueryKey });
    },
  });
}

export function useUpdateProductCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateProductCategory(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCategoriesQueryKey });
    },
  });
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteProductCategory(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCategoriesQueryKey });
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function usePublicProductsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: [...productsQueryKey, "public", params],
    queryFn: async () => {
      const payload = await api.publicProducts(params);
      const data = payload?.data;
      if (!Array.isArray(data)) {
        throw new ApiError("Beklenmeyen yanıt formatı");
      }
      return data.map(normalizeProduct).filter(Boolean);
    },
    enabled: options.enabled !== false,
  });
}

export function usePublicProductQuery(id, options = {}) {
  return useQuery({
    queryKey: [...productsQueryKey, "public", "detail", String(id)],
    queryFn: async () =>
      normalizeProductDetail(await api.publicProduct(id)),
    enabled: (options.enabled ?? true) !== false && Boolean(id),
    retry: false,
  });
}

export function useCartQuery(options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...cartQueryKey],
    queryFn: async () => {
      const payload = await api.publicCart(token);
      const data = payload?.data ?? payload;
      if (!data || typeof data !== "object") {
        throw new ApiError("Beklenmeyen yanıt formatı");
      }
      return {
        ...data,
        items: asArray(data.items),
      };
    },
    enabled: options.enabled !== false && Boolean(token),
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createCartItem(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
}

export function useCheckoutCart() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async () =>
      normalizeProductDetail(await api.checkoutCart(token)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
    },
  });
}
