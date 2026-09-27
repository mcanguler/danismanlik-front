"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  Image as ImageIcon,
  LoaderCircle,
  Newspaper,
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
import { cn } from "@/lib/utils";
import { formatDateTimeTr } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import {
  useAdminBlogCategoriesQuery,
  useAdminBlogPostsQuery,
  useDeleteBlogPost,
} from "@/lib/blog";

const LIST_PATH = "/dashboard/admin/blog";

const ACTIVE_FILTER_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "1", label: "Aktif" },
  { value: "0", label: "Pasif" },
];

const PUBLISH_FILTER_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "published", label: "Yayında" },
  { value: "draft", label: "Taslak" },
];

const selectClassName =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function PostAvatar({ post }) {
  return (
    <Avatar className="size-9 rounded-lg after:rounded-lg">
      <AvatarImage src={post.thumbnail} alt={post.title} className="rounded-lg" />
      <AvatarFallback className="rounded-lg">
        <ImageIcon className="size-4" />
      </AvatarFallback>
    </Avatar>
  );
}

function PublishBadge({ publishedAt }) {
  const published = Boolean(publishedAt);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        published
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-muted text-muted-foreground"
      )}
    >
      {published ? "Yayında" : "Taslak"}
    </span>
  );
}

export function BlogManager() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [publishFilter, setPublishFilter] = useState("");
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteBlogPost();

  const categoriesQuery = useAdminBlogCategoriesQuery();
  const categories = categoriesQuery.data ?? [];

  const query = useAdminBlogPostsQuery({
    page,
    ...(search ? { search } : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
    ...(activeFilter ? { is_active: activeFilter } : {}),
  });
  const posts = useMemo(() => query.data?.items ?? [], [query.data]);
  const filteredPosts = useMemo(
    () =>
      publishFilter === ""
        ? posts
        : posts.filter((item) =>
            publishFilter === "published"
              ? Boolean(item.published_at)
              : !item.published_at
          ),
    [posts, publishFilter]
  );
  const meta = query.data?.meta;

  const applySearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Blog yazısı silindi", type: "success" });
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
          <h1 className="text-xl font-semibold tracking-tight">Blog Yazıları</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {meta ? `${meta.total} blog yazısı` : "Blog yazıları"}
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => router.push(`${LIST_PATH}/yeni`)}
          className="h-10"
        >
          <Plus className="size-4" />
          Yeni Yazı
        </Button>
      </div>

      <form
        className="mt-4 flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          applySearch();
        }}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-8 w-48 rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Başlığa göre ara"
            type="text"
            value={searchInput}
          />
        </div>
        <Button size="sm" type="submit" variant="outline">
          Ara
        </Button>
        <select
          aria-label="Kategori filtresi"
          className={selectClassName}
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
        <select
          aria-label="Aktiflik filtresi"
          className={selectClassName}
          onChange={(event) => {
            setActiveFilter(event.target.value);
            setPage(1);
          }}
          value={activeFilter}
        >
          {ACTIVE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Yayın durumu filtresi"
          className={selectClassName}
          onChange={(event) => setPublishFilter(event.target.value)}
          value={publishFilter}
        >
          {PUBLISH_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </form>

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

        {query.isSuccess && filteredPosts.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <Newspaper className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Blog yazısı bulunmuyor</p>
            <p className="text-sm text-muted-foreground">
              {search || categoryId || activeFilter || publishFilter
                ? "Filtreleri değiştirerek tekrar arayabilirsiniz"
                : "İlk blog yazısını ekleyerek başlayın"}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`${LIST_PATH}/yeni`)}
            >
              <Plus className="size-4" />
              Yeni Yazı
            </Button>
          </div>
        )}

        {query.isSuccess && filteredPosts.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14 pl-4">Görsel</TableHead>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Yayın</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4">
                        <PostAvatar post={item} />
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.category?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={item.is_active} />
                      </TableCell>
                      <TableCell>
                        <PublishBadge publishedAt={item.published_at} />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTimeTr(item.published_at) ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => router.push(`${LIST_PATH}/${item.id}`)}
                            aria-label={`${item.title} düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(item)}
                            aria-label={`${item.title} sil`}
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
              {filteredPosts.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border bg-card p-4"
                >
                  <button
                    className="flex flex-col gap-2 text-left"
                    onClick={() => router.push(`${LIST_PATH}/${item.id}`)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <PostAvatar post={item} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {item.title || "—"}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {item.category?.name ?? "—"}
                          </p>
                        </div>
                      </div>
                      <PublishBadge publishedAt={item.published_at} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTimeTr(item.published_at) ?? "Yayınlanmadı"}
                    </span>
                  </button>
                  <div className="flex items-center justify-between gap-2 border-t pt-2">
                    <StatusBadge active={item.is_active} />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9"
                        onClick={() => router.push(`${LIST_PATH}/${item.id}`)}
                      >
                        <Pencil className="size-3.5" />
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 text-destructive hover:text-destructive"
                        onClick={() => setDeleting(item)}
                      >
                        <Trash2 className="size-3.5" />
                        Sil
                      </Button>
                    </div>
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
            <AlertDialogTitle>Blog yazısını sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.title ?? ""}&quot; başlıklı yazı silinecek. Bu
              işlem geri alınamaz.
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
