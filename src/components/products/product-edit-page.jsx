"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CircleAlert,
  CloudDownload,
  GalleryHorizontalEnd,
  LoaderCircle,
  Package,
  Search,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getQueryErrorMessage } from "@/lib/query-errors";
import {
  PRODUCT_TYPES,
  useAdminProductQuery,
} from "@/lib/products";
import { ProductInfoForm } from "@/components/products/product-info-form";
import { ProductSeoForm } from "@/components/products/product-seo-form";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductFields } from "@/components/products/product-fields";
import { ProductVariations } from "@/components/products/product-variations";
import { ProductDownloads } from "@/components/products/product-downloads";

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function ProductEditPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useAdminProductQuery(id);
  const product = query.data;

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (query.isError || !product) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
          <CircleAlert className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Ürün yüklenemedi</p>
          <p className="text-sm text-muted-foreground">
            {getQueryErrorMessage(query.error)}
          </p>
          <Button
            render={<Link href="/dashboard/admin/urunler" />}
            variant="outline"
          >
            Ürünlere Dön
          </Button>
        </div>
      </div>
    );
  }

  const isDigital = product.type === PRODUCT_TYPES.DIGITAL;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/dashboard/admin/urunler"
        >
          ← Ürünler
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {product.title}
          </h1>
          <StatusBadge active={product.is_active} />
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Ürün Bilgileri → SEO → Galeri → Custom Fields → Varyasyonlar →
          Dijital Dosyalar sırasıyla yönetin
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b [.border-b]:pb-4">
            <SectionTitle
              description="Ürünün temel ve satış bilgileri"
              icon={Package}
              title="Ürün Bilgileri"
            />
          </CardHeader>
          <CardContent className="pt-4">
            <ProductInfoForm product={product} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b [.border-b]:pb-4">
            <SectionTitle
              description="Arama motoru görünürlüğü"
              icon={Search}
              title="SEO"
            />
          </CardHeader>
          <CardContent className="pt-4">
            <ProductSeoForm product={product} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b [.border-b]:pb-4">
            <SectionTitle
              description="Ürün detay sayfası görselleri; thumbnail ayrı yönetilir"
              icon={GalleryHorizontalEnd}
              title="Galeri"
            />
          </CardHeader>
          <CardContent className="pt-4">
            <ProductGallery product={product} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b [.border-b]:pb-4">
            <SectionTitle
              description="Renk, beden gibi dinamik alanlar ve seçenekleri"
              icon={Tag}
              title="Custom Fields"
            />
          </CardHeader>
          <CardContent className="pt-4">
            <ProductFields product={product} />
          </CardContent>
        </Card>

        {!isDigital && (
          <Card>
            <CardHeader className="border-b [.border-b]:pb-4">
              <SectionTitle
                description="Seçenek kombinasyonlarına göre fiyat ve stok yönetimi"
                icon={SlidersHorizontal}
                title="Varyasyonlar"
              />
            </CardHeader>
            <CardContent className="pt-4">
              <ProductVariations product={product} />
            </CardContent>
          </Card>
        )}

        {isDigital && (
          <Card>
            <CardHeader className="border-b [.border-b]:pb-4">
              <SectionTitle
                description="Satın alma sonrası müşteriye sunulacak dosyalar"
                icon={CloudDownload}
                title="Dijital Dosyalar"
              />
            </CardHeader>
            <CardContent className="pt-4">
              <ProductDownloads product={product} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
