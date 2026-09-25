"use client";

import { useMemo, useState } from "react";
import {
  CircleAlert,
  Link2,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  MENU_LINK_SOURCES,
  MENU_LINK_SOURCE_LABELS,
  MENU_TARGETS,
  MENU_TARGET_LABELS,
} from "@/lib/menu-link-sources";
import { usePublicPagesQuery } from "@/lib/pages";
import { usePublicServiceCategoriesQuery } from "@/lib/service-categories";
import { usePublicServicesQuery } from "@/lib/services";
import {
  usePublicProductCategoriesQuery,
  usePublicProductsQuery,
} from "@/lib/products";
import { usePublicCoursesQuery } from "@/lib/courses";
import { usePublicServicePackagesQuery } from "@/lib/service-packages";
import {useCreateMenuItem, useUpdateMenuItem} from "@/lib/menus";

const selectClassName =
  "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function useSourceOptions(sourceType) {
  const pagesQuery = usePublicPagesQuery({
    enabled: sourceType === MENU_LINK_SOURCES.PAGE,
  });
  const categoriesQuery = usePublicServiceCategoriesQuery({
    enabled: sourceType === MENU_LINK_SOURCES.SERVICE_CATEGORY,
  });
  const servicesQuery = usePublicServicesQuery({
    enabled: sourceType === MENU_LINK_SOURCES.SERVICE,
  });
  const productCategoriesQuery = usePublicProductCategoriesQuery({
    enabled: sourceType === MENU_LINK_SOURCES.PRODUCT_CATEGORY,
  });
  const productsQuery = usePublicProductsQuery({
    enabled: sourceType === MENU_LINK_SOURCES.PRODUCT,
  });
  const coursesQuery = usePublicCoursesQuery({
    enabled: sourceType === MENU_LINK_SOURCES.COURSE,
  });
  const packagesQuery = usePublicServicePackagesQuery({
    enabled: sourceType === MENU_LINK_SOURCES.SERVICE_PACKAGE,
  });

  return useMemo(() => {
    const loading =
      pagesQuery.isPending ||
      categoriesQuery.isPending ||
      servicesQuery.isPending ||
      productCategoriesQuery.isPending ||
      productsQuery.isPending ||
      coursesQuery.isPending ||
      packagesQuery.isPending;

    switch (sourceType) {
      case MENU_LINK_SOURCES.PAGE:
        return {
          loading: pagesQuery.isPending,
          options: (pagesQuery.data ?? []).map((page) => ({
            id: String(page.id),
            label: page.title,
            url: `/${page.slug}`,
          })),
        };
      case MENU_LINK_SOURCES.SERVICE_CATEGORY:
        return {
          loading: categoriesQuery.isPending,
          options: (categoriesQuery.data ?? []).map((category) => ({
            id: String(category.id),
            label: category.name,
            url: `/hizmetler/${category.slug || category.id}`,
          })),
        };
      case MENU_LINK_SOURCES.SERVICE:
        return {
          loading: servicesQuery.isPending,
          options: (servicesQuery.data ?? [])
            .filter((service) => service.service_category?.slug)
            .map((service) => ({
              id: String(service.id),
              label: `${service.name ?? service.title} (${service.service_category.name ?? service.service_category.slug})`,
              url: `/hizmetler/${service.service_category.slug}/${service.slug ?? service.id}`,
            })),
        };
      case MENU_LINK_SOURCES.PRODUCT_CATEGORY:
        return {
          loading: productCategoriesQuery.isPending,
          options: (productCategoriesQuery.data ?? []).map((category) => ({
            id: String(category.id),
            label: category.name,
            url: `/urunler?category_id=${category.id}`,
          })),
        };
      case MENU_LINK_SOURCES.PRODUCT:
        return {
          loading: productsQuery.isPending,
          options: (productsQuery.data ?? []).map((product) => ({
            id: String(product.id),
            label: product.title,
            url: `/urunler/${product.slug || product.id}`,
          })),
        };
      case MENU_LINK_SOURCES.COURSE:
        return {
          loading: coursesQuery.isPending,
          options: (coursesQuery.data ?? []).map((course) => ({
            id: String(course.id),
            label: course.title,
            url: `/egitimler/${course.slug || course.id}`,
          })),
        };
      case MENU_LINK_SOURCES.SERVICE_PACKAGE:
        return {
          loading: packagesQuery.isPending,
          options: (packagesQuery.data ?? []).map((pack) => ({
            id: String(pack.id),
            label: pack.title,
            url: `/paketler/${pack.slug || pack.id}`,
          })),
        };
      default:
        return { loading: false, options: [] };
    }
  }, [
    sourceType,
    pagesQuery,
    categoriesQuery,
    servicesQuery,
    productCategoriesQuery,
    productsQuery,
    coursesQuery,
    packagesQuery,
  ]);
}

function descendantIdsOf(flatItems, rootId) {
  const ids = new Set();
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const item of flatItems) {
      if (String(item.parent_id ?? "") === String(current) && !ids.has(item.id)) {
        ids.add(item.id);
        queue.push(item.id);
      }
    }
  }
  return ids;
}

export function MenuItemFormDialog({
  open,
  menuId,
  item,
  flatItems,
  defaultParentId,
  onOpenChange,
}) {
  const isEdit = Boolean(item);
  const [sourceType, setSourceType] = useState(
    item?.page_id != null ? MENU_LINK_SOURCES.PAGE : MENU_LINK_SOURCES.MANUAL
  );
  const [sourceId, setSourceId] = useState("");
  const [title, setTitle] = useState(item?.title ?? "");
  const [titleTouched, setTitleTouched] = useState(isEdit);
  const [manualUrl, setManualUrl] = useState(
    item && item.page_id == null ? (item.url ?? "") : ""
  );
  const [target, setTarget] = useState(item?.target ?? MENU_TARGETS.SELF);
  const [parentId, setParentId] = useState(
    isEdit ? String(item?.parent_id ?? "") : String(defaultParentId ?? "")
  );
  const [sortOrder, setSortOrder] = useState(String(item?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(
    item ? Boolean(item.is_active) : true
  );
  const [error, setError] = useState("");

  const menuIdMissing = menuId == null || menuId === "";

  const options = useSourceOptions(sourceType);
  const selectedOption = options.options.find(
    (option) => option.id === sourceId
  );

  const resolvedUrl =
    sourceType === MENU_LINK_SOURCES.MANUAL
      ? manualUrl.trim()
      : (selectedOption?.url ?? "");
  const resolvedPageId =
    sourceType === MENU_LINK_SOURCES.PAGE && sourceId
      ? Number(sourceId)
      : null;

  const excludedIds = useMemo(() => {
    if (!isEdit || !item) return new Set();
    const ids = new Set([String(item.id)]);
    for (const id of descendantIdsOf(flatItems, item.id)) {
      ids.add(String(id));
    }
    return ids;
  }, [isEdit, item, flatItems]);

  const parentOptions = (flatItems ?? []).filter(
    (flatItem) => !excludedIds.has(String(flatItem.id))
  );

  const createItemMutation = useCreateMenuItem(menuId);
  const updateItemMutation = useUpdateMenuItem(menuId);
  const pending = createItemMutation.isPending || updateItemMutation.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (menuIdMissing) {
      setError(
        "Menü bilgisi yüklenemedi. Sayfayı yenileyip tekrar deneyin."
      );
      return;
    }

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Başlık zorunludur");
      return;
    }
    if (sourceType === MENU_LINK_SOURCES.MANUAL && !manualUrl.trim()) {
      setError("URL girin");
      return;
    }
    if (sourceType !== MENU_LINK_SOURCES.MANUAL && !sourceId) {
      setError("İçerik seçin");
      return;
    }

    const payload = {
      title: trimmedTitle,
      parent_id: parentId === "" ? null : Number(parentId),
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };

    if (sourceType === MENU_LINK_SOURCES.PAGE) {
      payload.page_id = resolvedPageId;
      payload.url = null;
      payload.target = MENU_TARGETS.SELF;
    } else if (sourceType === MENU_LINK_SOURCES.MANUAL) {
      payload.page_id = null;
      payload.url = manualUrl.trim();
      payload.target = target;
    } else {
      payload.page_id = null;
      payload.url = resolvedUrl;
      payload.target = MENU_TARGETS.SELF;
    }

    if (isEdit) {
      updateItemMutation.mutate(
        { id: item.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Menü öğesi güncellendi", type: "success" });
            onOpenChange(false);
          },
          onError: (mutationError) => {
            setError(getErrorMessage(mutationError));
          },
        }
      );
      return;
    }

    createItemMutation.mutate(
      payload,
      {
        onSuccess: () => {
          toast.add({ title: "Menü öğesi eklendi", type: "success" });
          onOpenChange(false);
        },
        onError: (mutationError) => {
          setError(getErrorMessage(mutationError));
        },
      }
    );
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Menü Öğesini Düzenle" : "Yeni Menü Öğesi"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {parentId === ""
              ? "Root seviyeye eklenir"
              : (flatItems.find((f) => String(f.id) === parentId)?.title ??
                "Alt öğe olarak eklenir")}
          </p>
        </DialogHeader>
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="menu_item_source">Link Kaynağı</Label>
            <select
              className={selectClassName}
              id="menu_item_source"
              onChange={(event) => {
                setSourceType(event.target.value);
                setSourceId("");
                setError("");
              }}
              value={sourceType}
            >
              {Object.entries(MENU_LINK_SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {sourceType === MENU_LINK_SOURCES.MANUAL ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="menu_item_url">URL</Label>
                <Input
                  id="menu_item_url"
                  onChange={(event) => setManualUrl(event.target.value)}
                  placeholder="/hakkimda veya https://..."
                  type="text"
                  value={manualUrl}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="menu_item_target">Target</Label>
                <select
                  className={selectClassName}
                  id="menu_item_target"
                  onChange={(event) => setTarget(event.target.value)}
                  value={target}
                >
                  {Object.entries(MENU_TARGET_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="menu_item_content">İçerik</Label>
              {options.loading ? (
                <div className="flex h-10 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  İçerikler yükleniyor...
                </div>
              ) : options.options.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
                  <CircleAlert className="size-3.5" />
                  Bu türde seçilebilir içerik bulunmuyor
                </div>
              ) : (
                <select
                  className={selectClassName}
                  id="menu_item_content"
                  onChange={(event) => {
                    setSourceId(event.target.value);
                    setError("");
                  }}
                  value={sourceId}
                >
                  <option value="">İçerik seçin</option>
                  {options.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {resolvedUrl && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    Oluşan URL: {resolvedUrl}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="menu_item_title">Başlık</Label>
            <Input
              id="menu_item_title"
              onChange={(event) => {
                setTitle(event.target.value);
                setTitleTouched(true);
              }}
              placeholder="Menüde görünen başlık"
              type="text"
              value={title}
            />
            {sourceType !== MENU_LINK_SOURCES.MANUAL &&
              selectedOption &&
              !titleTouched && (
                <Button
                  className="h-7 self-start text-xs"
                  onClick={() => setTitle(selectedOption.label)}
                  type="button"
                  variant="ghost"
                >
                  Başlığı içeriğinden doldur: {selectedOption.label}
                </Button>
              )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="menu_item_parent">Üst Öğe (Parent)</Label>
            <select
              className={selectClassName}
              id="menu_item_parent"
              onChange={(event) => setParentId(event.target.value)}
              value={parentId}
            >
              <option value="">Root (Ana seviye)</option>
              {parentOptions.map((flatItem) => (
                <option key={flatItem.id} value={flatItem.id}>
                  {flatItem.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Kendisi ve alt öğeleri parent olarak seçilemez
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="menu_item_sort">Sıra</Label>
              <Input
                id="menu_item_sort"
                inputMode="numeric"
                min="0"
                onChange={(event) => setSortOrder(event.target.value)}
                step="1"
                type="number"
                value={sortOrder}
              />
            </div>
            <div className="flex items-center justify-between gap-3 sm:mt-6">
              <Label htmlFor="menu_item_active">Aktif</Label>
              <Switch
                checked={isActive}
                id="menu_item_active"
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              className="h-10"
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              İptal
            </Button>
            <Button
              className="h-10"
              disabled={pending || menuIdMissing}
              type="submit"
            >
              {pending && <LoaderCircle className="size-4 animate-spin" />}
              {menuIdMissing
                ? "Menü Yüklenemedi"
                : pending
                  ? "Kaydediliyor..."
                  : isEdit
                    ? "Kaydet"
                    : "Öğe Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
