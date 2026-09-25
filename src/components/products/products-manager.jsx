"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CircleAlert,
  CloudDownload,
  Image as ImageIcon,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
  useAdminProductsQuery,
  useDeleteProduct,
  useProductCategoriesQuery,
} from "@/lib/products";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function TypeBadge({ type }) {
  const isDigital = type === PRODUCT_TYPES.DIGITAL;
  return (
    <span
      className={
        isDigital
          ? "inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400"
          : "inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400"
      }
    >
      {isDigital ? <CloudDownload className="size-3" /> : <Package className="size-3" />}
      {PRODUCT_TYPE_LABELS[type] ?? type}
    </span>
  );
}

function ProductAvatar({ product }) {
  return (
    <Avatar className="size-8 rounded-lg after:rounded-lg">
      <AvatarImage
        src={product.thumbnail}
        alt={product.title}
        className="rounded-lg"
      />
      <AvatarFallback className="rounded-lg">
        <ImageIcon className="size-4" />
      </AvatarFallback>
    </Avatar>
  );
}

function ProductPrice({ product }) {
  if (product.has_discount) {
    return (
      <div className="flex flex-col items-start">
        <span className="font-medium">{formatPrice(product.effective_price)}</span>
        <span className="text-xs text-muted-foreground line-through">
          {formatPrice(product.price)}
        </span>
      </div>
    );
  }
  return (
    <span className="whitespace-nowrap font-medium">
      {formatPrice(product.price)}
    </span>
  );
}

export function ProductsManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteProduct();

  const categoriesQuery = useProductCategoriesQuery();
  const categories = categoriesQuery.data ?? [];

  const query = useAdminProductsQuery({
    page,
    ...(search ? { search } : {}),
    ...(type ? { type } : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
  });
  const products = query.data?.items ?? [];
  const meta = query.data?.meta;

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Ürün silindi", type: "success" });
        setDeleting(null);
      },
      onError: (error) => {
        toast.add({
          title: "Silme başarısız",
          description: getErrorMessage(error),
          type: "error",
        });
        setDeleting(null);
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Ürünler</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {meta ? `${meta.total} ürün` : "Tüm ürünler"}
          </p>
        </div>
        <Button
          size="lg"
          className="h-10"
          render={<Link href="/dashboard/admin/urunler/yeni" />}
        >
          <Plus className="size-4" />
          Yeni Ürün
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-8 w-48 rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Ürün adına göre ara"
            type="text"
            value={search}
          />
        </div>
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          onChange={(event) => {
            setType(event.target.value);
            setPage(1);
          }}
          value={type}
        >
          <option value="">Tüm Tipler</option>
          <option value={PRODUCT_TYPES.PHYSICAL}>Fiziksel Ürün</option>
          <option value={PRODUCT_TYPES.DIGITAL}>Dijital Ürün</option>
        </select>
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          onChange={(event) => {
            setCategoryId(event.target.value);
            setPage(1);
          }}
          value={categoryId}
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {query.isPending && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {query.isError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
            <CircleAlert className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {getQueryErrorMessage(query.error)}
            </p>
            <Button variant="outline" onClick={() => query.refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && products.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <Package className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz ürün yok</p>
            <p className="text-sm text-muted-foreground">
              İlk ürünü ekleyerek mağazanı oluşturmayı başlat
            </p>
            <Button
              variant="outline"
              render={<Link href="/dashboard/admin/urunler/yeni" />}
            >
              <Plus className="size-4" />
              Yeni Ürün
            </Button>
          </div>
        )}

        {query.isSuccess && products.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14 pl-4">Görsel</TableHead>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="pl-4">
                        <ProductAvatar product={product} />
                      </TableCell>
                      <TableCell>
                        <Link
                          className="font-medium underline-offset-4 hover:underline"
                          href={`/dashboard/admin/urunler/${product.id}`}
                        >
                          {product.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {product.slug}
                        </p>
                      </TableCell>
                      <TableCell>
                        <TypeBadge type={product.type} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.category?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <ProductPrice product={product} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.isDigital ? "—" : product.stock}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={product.is_active} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            render={
                              <Link
                                href={`/dashboard/admin/urunler/${product.id}`}
                              />
                            }
                            aria-label={`${product.title} düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(product)}
                            aria-label={`${product.title} sil`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <ProductAvatar product={product} />
                    <div className="min-w-0 flex-1">
                      <Link
                        className="truncate font-medium underline-offset-4 hover:underline"
                        href={`/dashboard/admin/urunler/${product.id}`}
                      >
                        {product.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {product.slug}
                      </p>
                    </div>
                    <StatusBadge active={product.is_active} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <ProductPrice product={product} />
                    <TypeBadge type={product.type} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {product.category
                        ? `Kategori: ${product.category.name}`
                        : "Kategorisiz"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.isDigital ? "Stok yok" : `Stok: ${product.stock}`}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9"
                        render={
                          <Link href={`/dashboard/admin/urunler/${product.id}`} />
                        }
                      >
                        <Pencil className="size-3.5" />
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 text-destructive hover:text-destructive"
                        onClick={() => setDeleting(product)}
                      >
                        <Trash2 className="size-3.5" />
                        Sil
                      </Button>
                  </div>
                </div>
              ))}
            </div>

            {meta && meta.lastPage > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  disabled={meta.currentPage <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  size="sm"
                  variant="outline"
                >
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">
                  Sayfa {meta.currentPage} / {meta.lastPage}
                </span>
                <Button
                  disabled={meta.currentPage >= meta.lastPage}
                  onClick={() => setPage((current) => current + 1)}
                  size="sm"
                  variant="outline"
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.title ?? ""}&quot; ürünü galerisi, alanları,
              varyasyonları ve dosyalarıyla birlikte silinecek. Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-10"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
