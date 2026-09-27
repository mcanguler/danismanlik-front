"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useCreateTestimonial } from "@/lib/testimonials";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function TestimonialFormDialog({ open, onOpenChange }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [isApproved, setIsApproved] = useState(true);
  const [error, setError] = useState("");

  const createMutation = useCreateTestimonial();

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedMessage = message.trim();

    if (!trimmedFirstName) {
      setError("Ad zorunludur");
      return;
    }
    if (!trimmedLastName) {
      setError("Soyad zorunludur");
      return;
    }
    if (!trimmedMessage) {
      setError("Görüş zorunludur");
      return;
    }

    createMutation.mutate(
      {
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        message: trimmedMessage,
        is_approved: isApproved,
      },
      {
        onSuccess: () => {
          toast.add({ title: "Yorum eklendi", type: "success" });
          setFirstName("");
          setLastName("");
          setMessage("");
          setIsApproved(true);
          setError("");
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
          <DialogTitle>Yeni Danışan Yorumu</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="testimonial_first_name">Ad</Label>
              <Input
                id="testimonial_first_name"
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setError("");
                }}
                placeholder="Danışanın adı"
                type="text"
                value={firstName}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="testimonial_last_name">Soyad</Label>
              <Input
                id="testimonial_last_name"
                onChange={(event) => {
                  setLastName(event.target.value);
                  setError("");
                }}
                placeholder="Danışanın soyadı"
                type="text"
                value={lastName}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="testimonial_message">Görüş</Label>
            <Textarea
              id="testimonial_message"
              onChange={(event) => {
                setMessage(event.target.value);
                setError("");
              }}
              placeholder="Danışanın yorumu"
              rows={5}
              value={message}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <Label htmlFor="testimonial_approved">Durum</Label>
              <p className="text-xs text-muted-foreground">
                {isApproved ? "Yayınlanmış (onaylı)" : "Onay bekliyor"}
              </p>
            </div>
            <Switch
              checked={isApproved}
              id="testimonial_approved"
              onCheckedChange={(checked) => {
                setIsApproved(checked);
                setError("");
              }}
            />
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
            <Button className="h-10" disabled={createMutation.isPending} type="submit">
              {createMutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {createMutation.isPending ? "Ekleniyor..." : "Yorum Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
