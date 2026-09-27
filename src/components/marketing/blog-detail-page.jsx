/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock,
  LoaderCircle,
  Mail,
  Send,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTimeTr } from "@/lib/format";
import {
  useBlogCategoriesQuery,
  useBlogCommentsQuery,
  useBlogPostsQuery,
  useCreateBlogComment,
} from "@/lib/blog";
import { BlogBreadcrumb, BlogPageShell } from "@/components/marketing/blog-list-page";

const AUTHOR_NAME = "Sümeyra Aydın";
const AUTHOR_TITLE = "Kıdemli İlişki & Aile Danışmanı";
const AUTHOR_PORTRAIT_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC8ahMDvJQ9r_RPL-Cya4EJqcAe7CafYE5vh9kufa2ZzWvHhu5eMcQLh5UNzm8BSS5xSRDkC3SFFfmDCF-HkG3EZ_KGZq4NvuB6NBVnl5X88t1JL_Q4WQ0thVmy9Pc0j4GYJOdlwSgw3hR10tmhZJH74LItXfCBVkSrVVt7RzjYIrbYwlt1SMCAvfVkSfqjmXBuYccyPfLxEZimxhoqQFc6dXOPqwcJPha5L1a6OIP20HGUojex-wN2";

function readingLabel(content) {
  if (!content) return null;
  const words = String(content)
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} dk okuma`;
}

function formatPostDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatCommentDate(value) {
  return formatDateTimeTr(value);
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const winScroll =
        document.documentElement.scrollTop || document.body.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setProgress(height > 0 ? (winScroll / height) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-28 left-0 right-0 z-40 h-[3px] bg-blush-surface/50 pointer-events-none">
      <div
        className="h-full bg-accent-gold transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function BlogSidebar({ activeCategoryName }) {
  const categoriesQuery = useBlogCategoriesQuery();
  const categories = (categoriesQuery.data ?? []).filter(
    (item) => item.is_active
  );

  return (
    <aside className="lg:col-span-4 flex flex-col gap-8 sticky top-28">
      <div className="p-6 rounded-2xl bg-canvas-pure shadow-sm">
        <h3 className="font-title-md text-title-md text-primary font-semibold mb-4">
          Konu Başlıkları
        </h3>
        {categoriesQuery.isPending && (
          <div className="flex justify-center py-4">
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {categoriesQuery.isSuccess && categories.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Henüz kategori yok.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-xl hover:bg-blush-surface text-on-surface-variant hover:text-primary-container transition-all group",
                  category.name === activeCategoryName && "bg-blush-surface text-primary-container"
                )}
                href={`/blog?category=${category.slug}`}
              >
                <span className="font-body-sm text-body-sm font-medium group-hover:translate-x-1 transition-transform">
                  {category.name}
                </span>
                {category.posts_count != null && (
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-low text-secondary font-semibold">
                    {category.posts_count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 rounded-2xl bg-blush-surface shadow-sm">
        <Mail className="size-7 text-primary-container mb-2" />
        <h4 className="font-title-md text-title-md text-primary font-semibold mb-1">
          Haftalık Farkındalık Mektubu
        </h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
          Her pazar sabahı, kadınlığa ve ilişkilere dair derinleşen bir mektup
          e-postanıza gelsin.
        </p>
        <Link
          className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-burgundy-light transition-colors"
          href="/blog"
        >
          Blog Yazılarını Keşfet
        </Link>
      </div>
    </aside>
  );
}

function RelatedPostCard({ post }) {
  return (
    <article className="flex flex-col rounded-3xl bg-canvas-pure shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
      <Link className="flex h-full flex-col" href={`/blog/${post.slug}`}>
        <div className="relative h-56 w-full overflow-hidden">
          {post.thumbnail ? (
            <img
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={post.thumbnail}
            />
          ) : (
            <div className="w-full h-full bg-blush-surface" />
          )}
          {post.category_name && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-canvas-pure/90 backdrop-blur-md text-primary-container font-label-sm text-label-sm font-semibold">
              {post.category_name}
            </span>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant mb-2">
              <span>{formatPostDate(post.published_at) ?? ""}</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-3 group-hover:text-primary-container transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.short_description && (
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 leading-relaxed mb-4">
                {post.short_description}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-primary-container font-label-md text-label-md font-semibold group-hover:translate-x-1 transition-transform">
            Yazıyı Oku
            <ChevronRight className="size-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}

function RelatedArticles({ post }) {
  const query = useBlogPostsQuery({
    ...(post.category ? { category: post.category.slug } : {}),
  });
  const related = (query.data?.items ?? [])
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  if (query.isPending || related.length === 0) return null;

  return (
    <section className="w-full py-16 bg-surface-container-low">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-label-md text-label-md text-accent-gold uppercase tracking-wider font-semibold">
              Keşfetmeye Devam Edin
            </span>
            <h2 className="font-headline-md text-headline-md text-primary font-semibold mt-1">
              İlginizi Çekebilecek Diğer Rehberler
            </h2>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 font-label-lg text-label-lg text-primary-container font-semibold hover:text-burgundy-light transition-colors"
            href="/blog"
          >
            Tüm Blog Yazılarını Gör
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {related.map((item) => (
            <RelatedPostCard key={item.id} post={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CommentAvatar({ name }) {
  const initials = String(name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blush-hover text-primary-container font-bold font-label-lg text-label-lg">
      {initials || "?"}
    </div>
  );
}

function CommentForm({ slug, parent, onDone }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [content, setContent] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const createMutation = useCreateBlogComment(slug);
  const suffix = parent ? `_${parent.id}` : "";

  const handleSubmit = (event) => {
    event.preventDefault();
    setFieldErrors({});
    setError("");

    const nextErrors = {};
    if (!firstName.trim()) nextErrors.first_name = "Ad zorunludur";
    if (!lastName.trim()) nextErrors.last_name = "Soyad zorunludur";
    if (!content.trim()) nextErrors.content = "Yorum alanı zorunludur";
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    createMutation.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        content: content.trim(),
        ...(parent ? { parent_id: parent.id } : {}),
      },
      {
        onSuccess: () => {
          setFirstName("");
          setLastName("");
          setContent("");
          setSuccess(true);
          if (onDone) onDone();
        },
        onError: (mutationError) => {
          const mapped = {};
          for (const [field, messages] of Object.entries(
            mutationError.errors ?? {}
          )) {
            mapped[field] = Array.isArray(messages) ? messages[0] : messages;
          }
          setFieldErrors(mapped);
          if (!mutationError.errors || Object.keys(mutationError.errors).length === 0) {
            setError(mutationError.message ?? "Yorum gönderilemedi");
          }
        },
      }
    );
  };

  if (success && !parent) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-canvas-cream shadow-sm">
        <div className="flex flex-col items-start gap-3 rounded-2xl bg-blush-surface p-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-pure text-primary-container font-label-sm text-label-sm font-semibold">
            <BadgeCheck className="size-4" />
            <span>Yorumunuz alındı</span>
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Yorumunuz onay bekliyor. Onaylandığında bu sayfada yayınlanacaktır.
            Katkınız için teşekkür ederiz.
          </p>
          <button
            className="font-label-md text-label-md font-semibold text-primary-container hover:underline"
            onClick={() => setSuccess(false)}
            type="button"
          >
            Yeni yorum yaz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-3xl bg-canvas-cream shadow-sm",
        parent ? "p-6 sm:p-8" : "p-8 sm:p-10"
      )}
    >
      {parent && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-canvas-pure px-4 py-2.5">
          <span className="font-label-md text-label-md text-primary-container font-semibold">
            {parent.name || "Yorum"} kullanıcısına yanıt veriyorsunuz
          </span>
          <button
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-container"
            onClick={onDone}
            type="button"
          >
            Vazgeç
          </button>
        </div>
      )}
      <div className="mb-6">
        <span className="font-label-md text-label-md text-accent-gold uppercase tracking-wider font-semibold">
          Görüşünüz Değerli
        </span>
        <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mt-1">
          {parent ? "Yanıt Yazın" : "Yorum Bırakın"}
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Duygu ve deneyimlerinizi paylaşarak topluluğumuzun farkındalığına
          katkıda bulunabilirsiniz.
        </p>
      </div>
      <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label
              className="font-label-md text-label-md text-primary font-semibold"
              htmlFor={`comment_first_name${suffix}`}
            >
              Adınız <span className="text-error">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-canvas-pure font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/20 shadow-sm"
              id={`comment_first_name${suffix}`}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Örn: Elif"
              type="text"
              value={firstName}
            />
            {fieldErrors.first_name && (
              <p className="text-xs text-error">{fieldErrors.first_name}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              className="font-label-md text-label-md text-primary font-semibold"
              htmlFor={`comment_last_name${suffix}`}
            >
              Soyadınız <span className="text-error">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-canvas-pure font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/20 shadow-sm"
              id={`comment_last_name${suffix}`}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Örn: Yılmaz"
              type="text"
              value={lastName}
            />
            {fieldErrors.last_name && (
              <p className="text-xs text-error">{fieldErrors.last_name}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="font-label-md text-label-md text-primary font-semibold"
            htmlFor={`comment_body${suffix}`}
          >
            Düşünceleriniz <span className="text-error">*</span>
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl bg-canvas-pure font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/20 shadow-sm resize-y"
            id={`comment_body${suffix}`}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Bu yazı size ne hissettirdi? Deneyimlerinizi paylaşın..."
            rows={4}
            value={content}
          />
          {fieldErrors.content && (
            <p className="text-xs text-error">{fieldErrors.content}</p>
          )}
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <div className="pt-2">
          <button
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-burgundy-light transition-all duration-200 disabled:opacity-60"
            disabled={createMutation.isPending}
            type="submit"
          >
            {createMutation.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            <span>
              {createMutation.isPending ? "Gönderiliyor..." : "Yorumu Gönder"}
            </span>
          </button>
          <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">
            Yorumunuz onaylandıktan sonra yayınlanır.
          </p>
        </div>
      </form>
    </div>
  );
}

function CommentItem({ comment, slug, onReply }) {
  const [replying, setReplying] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl p-6 shadow-sm",
          comment.parent_id ? "bg-blush-surface sm:ml-12" : "bg-canvas-cream"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CommentAvatar name={comment.name} />
            <div>
              <h4 className="font-title-md text-title-md text-primary font-semibold">
                {comment.name}
              </h4>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {formatCommentDate(comment.created_at) ?? ""}
              </span>
            </div>
          </div>
        </div>
        <p className="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-line">
          {comment.content}
        </p>
        <div className="flex items-center gap-4 pt-1">
          <button
            className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary-container hover:underline"
            onClick={() => onReply(comment)}
            type="button"
          >
            <Send className="size-3.5" />
            <span>Yanıtla</span>
          </button>
        </div>
      </div>

      {replying && (
        <div className="sm:ml-12">
          <CommentForm
            onDone={() => setReplying(false)}
            parent={comment}
            slug={slug}
          />
        </div>
      )}

      {comment.children.length > 0 && (
        <div className="flex flex-col gap-6 sm:ml-12">
          {comment.children.map((child) => (
            <CommentItem
              comment={child}
              key={child.id}
              onReply={onReply}
              slug={slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BlogPostComments({ slug }) {
  const [replyTo, setReplyTo] = useState(null);
  const query = useBlogCommentsQuery(slug);
  const comments = query.data ?? [];
  const countComments = (list) =>
    list.reduce((sum, comment) => sum + 1 + countComments(comment.children), 0);
  const totalCount = query.isSuccess ? countComments(comments) : 0;

  return (
    <section className="w-full py-20 bg-canvas-pure">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-10">
            <div className="flex items-center gap-3">
              <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">
                Yorumlar &amp; Danışan Katkıları
              </h2>
              {query.isSuccess && (
                <span className="px-3 py-1 rounded-full bg-blush-surface text-primary-container font-label-md text-label-md font-bold">
                  {totalCount}
                </span>
              )}
            </div>
            <span className="font-body-sm text-body-sm text-secondary hidden sm:inline">
              Güvenli ve saygılı paylaşım alanı
            </span>
          </div>

          {query.isPending && (
            <div className="flex justify-center py-10">
              <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {query.isError && (
            <div className="mb-16 flex items-center gap-2 rounded-2xl border border-error/20 bg-error/5 px-4 py-3">
              <CircleAlert className="size-4 text-error" />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Yorumlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.
              </p>
            </div>
          )}

          {query.isSuccess && comments.length === 0 && (
            <p className="mb-16 font-body-md text-body-md text-on-surface-variant">
              Henüz onaylanmış yorum yok. İlk yorumu siz yazın.
            </p>
          )}

          {query.isSuccess && comments.length > 0 && (
            <div className="mb-16 flex flex-col gap-6">
              {comments.map((comment) => (
                <CommentItem
                  comment={comment}
                  key={comment.id}
                  onReply={setReplyTo}
                  slug={slug}
                />
              ))}
            </div>
          )}

          {replyTo && (
            <div className="mb-8">
              <CommentForm
                onDone={() => setReplyTo(null)}
                parent={replyTo}
                slug={slug}
              />
            </div>
          )}

          <CommentForm slug={slug} />
        </div>
      </div>
    </section>
  );
}

export default function BlogDetailContent({ post }) {
  return (
    <BlogPageShell>
      <ReadingProgressBar />
      <section className="w-full pt-8 pb-4">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <BlogBreadcrumb
            items={[
              { label: "Ana Sayfa", href: "/" },
              { label: "Blog", href: "/blog" },
              ...(post.category_name
                ? [
                    {
                      label: post.category_name,
                      href: post.category?.slug
                        ? `/blog?category=${post.category.slug}`
                        : "/blog",
                    },
                  ]
                : []),
              { label: post.title },
            ]}
          />
        </div>
      </section>

      <header className="w-full pt-4 pb-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {post.category_name && (
                <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-blush-surface text-primary-container font-label-sm text-label-sm tracking-widest uppercase">
                  {post.category_name}
                </span>
              )}
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>
            {post.short_description && (
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-8">
                {post.short_description}
              </p>
            )}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-5 rounded-2xl bg-canvas-pure shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  alt={AUTHOR_NAME}
                  className="w-14 h-14 rounded-full object-cover shadow-sm"
                  src={AUTHOR_PORTRAIT_URL}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-title-md text-title-md text-primary font-semibold">
                      {AUTHOR_NAME}
                    </span>
                    <BadgeCheck className="size-4 text-accent-gold" />
                  </div>
                  <span className="font-label-md text-label-md text-secondary">
                    {AUTHOR_TITLE}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 font-label-sm text-label-sm text-on-surface-variant">
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {formatPostDate(post.published_at)}
                      </span>
                    )}
                    {readingLabel(post.content) && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {readingLabel(post.content)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start lg:self-center">
                <a
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-blush-surface hover:text-primary-container transition-all"
                  href={`https://wa.me/?text=${encodeURIComponent(post.title)}`}
                  rel="noopener noreferrer"
                  target="_blank"
                  title="WhatsApp ile Paylaş"
                >
                  <Send className="size-4" />
                  <span className="hidden sm:inline">Paylaş</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {post.thumbnail && (
        <section className="w-full pb-14">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
            <div className="relative w-full h-[320px] sm:h-[460px] lg:h-[560px] rounded-3xl overflow-hidden shadow-xl">
              <img
                alt={post.title}
                className="w-full h-full object-cover"
                src={post.thumbnail}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
            </div>
          </div>
        </section>
      )}

      <main className="w-full pb-20">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            <article className="lg:col-span-8 flex flex-col">
              {post.content ? (
                <div
                  className="prose prose-sm max-w-none font-body-lg text-body-lg text-on-surface-variant [&_h1]:font-headline-md [&_h1]:text-headline-md [&_h1]:font-semibold [&_h1]:text-primary [&_h2]:font-headline-md [&_h2]:text-headline-md [&_h2]:font-semibold [&_h2]:text-primary [&_h3]:font-title-lg [&_h3]:text-title-lg [&_h3]:font-semibold [&_h3]:text-primary [&_strong]:text-primary [&_a]:text-primary-container [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-primary [&_img]:rounded-2xl"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <p className="font-body-lg text-body-lg text-on-surface-variant italic">
                  Bu yazı için henüz içerik yayınlanmadı.
                </p>
              )}

              <div className="pt-8">
                <BookOpen className="size-6 text-accent-gold mb-3" />
                <p className="font-label-md text-label-md text-secondary font-semibold uppercase tracking-wider">
                  {AUTHOR_NAME} • {AUTHOR_TITLE}
                </p>
              </div>
            </article>

            <BlogSidebar activeCategoryName={post.category_name} />
          </div>
        </div>
      </main>

      <RelatedArticles post={post} />

      <BlogPostComments slug={post.slug} />
    </BlogPageShell>
  );
}
