"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  CreditCard,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { ServicesPageShell } from "@/components/marketing/services-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { ROLES } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";
import { formatDateTimeTr, formatPrice } from "@/lib/format";
import {
  CART_ITEM_TYPES,
  useApplyCartCoupon,
  useCartQuery,
  useCheckoutCart,
  useDeleteCartItem,
  useRemoveCartCoupon,
  useUpdateCartItem,
} from "@/lib/products";
import { toast } from "@/components/ui/toast";

function errorMessage(error) {
  return error instanceof ApiError ? error.message : "Beklenmeyen bir hata oluştu";
}

const CART_ITEM_TYPE_META = {
  [CART_ITEM_TYPES.PRODUCT]: {
    label: "Ürün",
    icon: ShoppingBag,
    href: (item) => `/urunler/${item.product?.slug || item.product?.id}`,
  },
  [CART_ITEM_TYPES.APPOINTMENT]: {
    label: "Randevu",
    icon: CalendarClock,
    href: () => null,
  },
  [CART_ITEM_TYPES.SERVICE_PACKAGE]: {
    label: "Hizmet Paketi",
    icon: Package,
    href: (item) => `/paketler/${item.item?.slug || item.item?.id}`,
  },
  [CART_ITEM_TYPES.COURSE]: {
    label: "Eğitim",
    icon: GraduationCap,
    href: (item) => `/egitimler/${item.item?.slug || item.item?.id}`,
  },
};

function cartItemTypeMeta(item) {
  return (
    CART_ITEM_TYPE_META[item.item_type] ??
    CART_ITEM_TYPE_META[CART_ITEM_TYPES.PRODUCT]
  );
}

function CartItemMedia({ item, product, typeMeta }) {
  const Icon = typeMeta.icon;
  const href = typeMeta.href(item);
  const inner = product?.thumbnail ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={product.title ?? typeMeta.label}
      className="size-full object-cover"
      src={product.thumbnail}
    />
  ) : (
    <Icon className="size-7 text-primary-container" />
  );
  const className =
    "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container-highest sm:size-24";

  return href ? (
    <Link className={className} href={href}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function CartItemTitle({ item, product, typeMeta }) {
  const href = typeMeta.href(item);
  const title =
    item.item_type === CART_ITEM_TYPES.PRODUCT
      ? (product?.title ?? "Ürün")
      : (item.item?.title ?? typeMeta.label);

  return href ? (
    <Link
      className="font-title-md text-title-md font-bold text-primary hover:text-burgundy-light"
      href={href}
    >
      {title}
    </Link>
  ) : (
    <span className="font-title-md text-title-md font-bold text-primary">
      {title}
    </span>
  );
}

function CartItem({ item, onQuantityChange, onRemove, busy }) {
  const typeMeta = cartItemTypeMeta(item);
  const product = item.product ?? null;
  const isProduct = item.item_type === CART_ITEM_TYPES.PRODUCT;
  const quantity = Number(item.quantity ?? 1);
  const unitPrice = Number(item.unit_price ?? 0);
  const total = Number(item.total ?? unitPrice * quantity);

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-canvas-pure p-4 shadow-sm sm:flex-row sm:items-center">
      <CartItemMedia item={item} product={product} typeMeta={typeMeta} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-blush-surface px-2 py-0.5 text-xs font-semibold text-primary-container">
            <typeMeta.icon className="size-3" />
            {typeMeta.label}
          </span>
        </div>
        <div className="mt-1.5">
          <CartItemTitle item={item} product={product} typeMeta={typeMeta} />
        </div>
        {isProduct && item.variation?.sku && (
          <p className="mt-1 text-xs text-muted-foreground">
            SKU: {item.variation.sku}
          </p>
        )}
        {!isProduct && item.item?.start_at && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTimeTr(item.item.start_at)}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Birim fiyat: {formatPrice(unitPrice)}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        {isProduct ? (
          <div className="flex items-center rounded-xl bg-canvas-cream p-1">
            <button
              aria-label="Adedi azalt"
              className="flex size-8 items-center justify-center rounded-lg text-primary hover:bg-canvas-pure disabled:opacity-50"
              disabled={busy || quantity <= 1}
              type="button"
              onClick={() => onQuantityChange(item, quantity - 1)}
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold text-primary">
              {quantity}
            </span>
            <button
              aria-label="Adedi artır"
              className="flex size-8 items-center justify-center rounded-lg text-primary hover:bg-canvas-pure disabled:opacity-50"
              disabled={busy}
              type="button"
              onClick={() => onQuantityChange(item, quantity + 1)}
            >
              <Plus className="size-4" />
            </button>
          </div>
        ) : (
          <span className="rounded-full bg-canvas-cream px-3 py-1 text-xs font-semibold text-primary">
            {quantity} adet
          </span>
        )}
        <div className="flex items-center gap-3">
          <span className="font-title-md text-title-md font-bold text-primary-container">
            {formatPrice(total)}
          </span>
          <button
            aria-label="Sepetten kaldır"
            className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
            disabled={busy}
            type="button"
            onClick={() => onRemove(item)}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartPage() {
  const router = useRouter();
  const { status, user } = useAuth();
  const cartQuery = useCartQuery({ enabled: status === "authenticated" });
  const updateItem = useUpdateCartItem();
  const deleteItem = useDeleteCartItem();
  const checkout = useCheckoutCart();
  const applyCoupon = useApplyCartCoupon();
  const removeCoupon = useRemoveCartCoupon();
  const [busyId, setBusyId] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(null);

  const items = cartQuery.data?.items ?? [];
  const meta = cartQuery.data?.meta ?? {};
  const subtotal = Number(meta.subtotal ?? 0);
  const discount = Number(meta.discount ?? 0);
  const total = Number(meta.total ?? 0);
  const itemCount = Number(meta.count ?? items.length);
  const appliedCoupon = meta.coupon ?? null;

  const handleQuantityChange = (item, quantity) => {
    if (quantity < 1) return;
    setBusyId(item.id);
    updateItem.mutate(
      { id: item.id, quantity },
      {
        onError: (error) => toast.add({ title: "Adet güncellenemedi", description: errorMessage(error), type: "error" }),
        onSettled: () => setBusyId(null),
      }
    );
  };

  const handleRemove = (item) => {
    setBusyId(item.id);
    deleteItem.mutate(item.id, {
      onSuccess: () => toast.add({ title: "Öğe sepetten kaldırıldı", type: "success" }),
      onError: (error) => toast.add({ title: "Öğe kaldırılamadı", description: errorMessage(error), type: "error" }),
      onSettled: () => setBusyId(null),
    });
  };

  const handleApplyCoupon = (event) => {
    event.preventDefault();
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Kupon kodu girin");
      return;
    }
    setCouponError(null);
    applyCoupon.mutate(code, {
      onSuccess: (data) => {
        setCouponInput("");
        toast.add({
          title: "Kupon uygulandı",
          description: data.meta?.coupon?.code
            ? `Kod: ${data.meta.coupon.code}`
            : undefined,
          type: "success",
        });
      },
      onError: (error) => {
        const message = errorMessage(error);
        setCouponError(message);
        toast.add({ title: "Kupon uygulanamadı", description: message, type: "error" });
      },
    });
  };

  const handleRemoveCoupon = () => {
    setCouponError(null);
    removeCoupon.mutate(undefined, {
      onSuccess: () => toast.add({ title: "Kupon kaldırıldı", type: "success" }),
      onError: (error) => toast.add({ title: "Kupon kaldırılamadı", description: errorMessage(error), type: "error" }),
    });
  };

  const handleCheckout = () => {
    if (user?.role !== ROLES.CUSTOMER) {
      toast.add({ title: "Giriş gerekli", description: "Ödeme için müşteri hesabıyla giriş yapmalısınız.", type: "info" });
      router.push("/login");
      return;
    }
    checkout.mutate(undefined, {
      onSuccess: (order) => {
        toast.add({ title: "Sipariş oluşturuldu", type: "success" });
        router.push(`/odeme/${order.id}`);
      },
      onError: (error) => toast.add({ title: "Sipariş oluşturulamadı", description: errorMessage(error), type: "error" }),
    });
  };

  if (status === "loading" || cartQuery.isPending) {
    return (
      <ServicesPageShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoaderCircle className="size-7 animate-spin text-muted-foreground" />
        </div>
      </ServicesPageShell>
    );
  }

  if (status !== "authenticated") {
    return (
      <ServicesPageShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
          <ShoppingBag className="size-12 text-accent-gold" />
          <h1 className="font-headline-md text-headline-md font-semibold text-primary">Sepetinizi görüntüleyin</h1>
          <p className="text-sm text-muted-foreground">Sepetinize erişmek için giriş yapmanız gerekiyor.</p>
          <Button onClick={() => router.push("/login")}>Giriş Yap</Button>
        </div>
      </ServicesPageShell>
    );
  }

  if (cartQuery.isError) {
    return (
      <ServicesPageShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
          <CircleAlert className="size-10 text-destructive" />
          <h1 className="font-headline-md text-headline-md font-semibold text-primary">Sepet yüklenemedi</h1>
          <p className="text-sm text-muted-foreground">{errorMessage(cartQuery.error)}</p>
          <Button variant="outline" onClick={() => cartQuery.refetch()}>Tekrar Dene</Button>
        </div>
      </ServicesPageShell>
    );
  }

  return (
    <ServicesPageShell>
      <div className="bg-canvas-cream py-8 sm:py-12">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link className="hover:text-primary" href="/">Ana Sayfa</Link>
            <ChevronRight className="size-4" />
            <span className="font-semibold text-primary">Sepetim</span>
          </div>
          <div className="mb-8 flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary-container text-on-primary"><ShoppingBag className="size-5" /></div>
            <div><h1 className="font-headline-lg text-headline-lg font-semibold text-primary">Sepetim</h1><p className="text-sm text-muted-foreground">{itemCount} öğe seçtiniz</p></div>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-canvas-pure px-4 py-20 text-center shadow-sm">
              <ShoppingBag className="size-12 text-accent-gold" />
              <h2 className="font-headline-md text-headline-md font-semibold text-primary">Sepetiniz boş</h2>
              <p className="max-w-md text-sm text-muted-foreground">Ürün, eğitim, hizmet paketi ekleyerek veya randevu alarak alışverişe başlayabilirsiniz.</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button render={<Link href="/urunler" />}>Ürünleri Keşfet</Button>
                <Button render={<Link href="/hizmetler" />} variant="outline">Hizmetler</Button>
                <Button render={<Link href="/egitimler" />} variant="outline">Eğitimler</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="flex flex-col gap-4 lg:col-span-7">
                <div className="rounded-2xl bg-blush-surface p-4 text-sm text-on-secondary-container"><strong className="text-primary">Güvenli alışveriş:</strong> Ödeme ve dijital teslimat işlemleriniz güvenli altyapıyla korunur.</div>
                {items.map((item) => <CartItem busy={busyId === item.id} item={item} key={item.id} onQuantityChange={handleQuantityChange} onRemove={handleRemove} />)}
                <Link className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary-container hover:text-burgundy-light" href="/urunler"><ArrowLeft className="size-4" /> Alışverişe devam et</Link>
              </div>
              <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:col-span-5">
                <div className="rounded-2xl bg-canvas-pure p-5 shadow-md sm:p-7">
                  <div className="mb-5 flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-3"><div className="flex items-center gap-2"><ShoppingBag className="size-5 text-primary-container" /><h2 className="font-title-lg text-title-lg font-bold text-primary">Sipariş Özeti</h2></div><span className="rounded-full bg-blush-surface px-2.5 py-0.5 text-xs font-semibold text-primary-container">{itemCount} Öğe</span></div>

                  {appliedCoupon ? (
                    <div className="mb-5 flex items-center justify-between gap-2 rounded-lg bg-blush-surface px-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <Tag className="size-4 shrink-0 text-primary-container" />
                        <span className="truncate text-sm font-semibold text-primary-container">{appliedCoupon.code}</span>
                      </div>
                      <button
                        className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                        disabled={removeCoupon.isPending}
                        type="button"
                        onClick={handleRemoveCoupon}
                      >
                        {removeCoupon.isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
                        Kaldır
                      </button>
                    </div>
                  ) : (
                    <form className="mb-1 flex gap-2" onSubmit={handleApplyCoupon}>
                      <Input
                        className="h-10 bg-canvas-cream"
                        placeholder="Kupon kodunuz"
                        value={couponInput}
                        onChange={(event) => setCouponInput(event.target.value)}
                      />
                      <Button className="h-10" disabled={applyCoupon.isPending} type="submit" variant="outline">
                        {applyCoupon.isPending ? <LoaderCircle className="size-4 animate-spin" /> : "Uygula"}
                      </Button>
                    </form>
                  )}
                  {couponError && !appliedCoupon && (
                    <p className="mb-4 flex items-center gap-1.5 text-xs font-medium text-destructive"><CircleAlert className="size-3.5 shrink-0" /> {couponError}</p>
                  )}

                  <div className="space-y-3 border-t border-border-delicate pt-4 text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>Ara toplam</span><span>{formatPrice(subtotal)}</span></div>
                    {discount > 0 && (
                      <div className="flex justify-between font-semibold text-primary-container"><span>Kupon indirimi</span><span>-{formatPrice(discount)}</span></div>
                    )}
                    <div className="flex justify-between text-muted-foreground"><span>Kargo</span><span className="font-semibold text-secondary">Ücretsiz</span></div>
                    <div className="flex items-end justify-between border-t border-border-delicate pt-4"><div><span className="block font-title-md font-bold text-primary">Toplam Tutar</span><span className="text-xs text-muted-foreground">Güvenli ödeme</span></div><span className="font-headline-md font-bold text-primary-container">{formatPrice(total)}</span></div>
                  </div>
                  <Button className="mt-6 h-12 w-full text-base" disabled={checkout.isPending} onClick={handleCheckout}><LockKeyhole className="size-4" />{checkout.isPending ? "Hazırlanıyor..." : "Güvenle Öde ve Devam Et"}</Button>
                  <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><ShieldCheck className="size-4 text-accent-gold" /> Güvenli ödeme</span><span className="flex items-center gap-1"><CreditCard className="size-4 text-primary-container" /> 3D Secure</span><span className="flex items-center gap-1"><Truck className="size-4 text-secondary" /> Hızlı teslimat</span></div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </ServicesPageShell>
  );
}
