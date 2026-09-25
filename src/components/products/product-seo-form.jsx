"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useUpdateProduct } from "@/lib/products";

const seoSchema = z.object({
  seo_title: z.string().max(255, "En fazla 255 karakter olabilir"),
  seo_description: z.string(),
});

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function ProductSeoForm({ product }) {
  const update = useUpdateProduct();
  const fieldNames = Object.keys(seoSchema.shape);

  const form = useForm({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      seo_title: product?.seo_title ?? "",
      seo_description: product?.seo_description ?? "",
    },
  });

  const handleError = (error) => {
    if (error instanceof ApiError) {
      for (const [field, messages] of Object.entries(error.errors ?? {})) {
        if (fieldNames.includes(field)) {
          const message = Array.isArray(messages) ? messages[0] : messages;
          form.setError(field, { message });
        }
      }
      form.setError("root", { message: error.message });
    } else {
      form.setError("root", { message: getErrorMessage(error) });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    update.mutate(
      {
        id: product.id,
        payload: {
          seo_title: values.seo_title ?? "",
          seo_description: values.seo_description ?? "",
        },
      },
      {
        onSuccess: (updated) => {
          toast.add({ title: "SEO bilgileri kaydedildi", type: "success" });
          form.reset({
            seo_title: updated.seo_title ?? "",
            seo_description: updated.seo_description ?? "",
          });
        },
        onError: handleError,
      }
    );
  });

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product_seo_title">SEO Title</Label>
        <Input
          id="product_seo_title"
          placeholder="SEO başlığı"
          {...form.register("seo_title")}
        />
        {form.formState.errors.seo_title && (
          <p className="text-xs text-destructive">
            {form.formState.errors.seo_title.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product_seo_description">SEO Description</Label>
        <Textarea
          id="product_seo_description"
          placeholder="SEO açıklaması"
          rows={3}
          {...form.register("seo_description")}
        />
        {form.formState.errors.seo_description && (
          <p className="text-xs text-destructive">
            {form.formState.errors.seo_description.message}
          </p>
        )}
      </div>
      {form.formState.errors.root && (
        <p className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <div className="flex justify-end">
        <Button
          className="h-10"
          disabled={update.isPending}
          type="submit"
        >
          {update.isPending && (
            <LoaderCircle className="size-4 animate-spin" />
          )}
          {update.isPending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
