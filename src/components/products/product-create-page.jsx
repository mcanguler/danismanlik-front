"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductInfoForm } from "@/components/products/product-info-form";

export function ProductCreatePage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/dashboard/admin/urunler"
        >
          ← Ürünler
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">Yeni Ürün</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Ürünü oluşturduktan sonra galeri, alanlar, varyasyonlar ve dijital
          dosyaları düzenleyebilirsiniz
        </p>
      </div>

      <Card>
        <CardHeader className="border-b [.border-b]:pb-4">
          <CardTitle>Ürün Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ProductInfoForm
            onCreated={(created) =>
              router.replace(`/dashboard/admin/urunler/${created.id}`)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
