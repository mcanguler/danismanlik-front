"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  LoaderCircle,
  RotateCcw,
  Save,
  ShieldAlert,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { isApiError } from "@/lib/query-errors";
import { cn } from "@/lib/utils";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_LABELS,
  useAdminNotificationTemplateQuery,
  usePreviewNotificationTemplate,
  useResetNotificationTemplate,
  useUpdateNotificationTemplate,
} from "@/lib/notification-templates";
import {
  estimateSmsSegments,
  findUnknownVariables,
  insertVariable,
} from "@/lib/notification-template-utils.mjs";
import { NOTIFICATION_TEMPLATES_PATH } from "@/components/notification-templates/notification-templates-manager";

function getErrorMessage(error) {
  if (isApiError(error)) return error.message || "Beklenmeyen bir hata oluştu";
  return "Beklenmeyen bir hata oluştu";
}

function firstMessage(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function buildDrafts(template) {
  const drafts = {};
  for (const channel of template.channels) {
    const server = template.templates[channel] ?? {};
    drafts[channel] = {
      subject: server.subject ?? "",
      body: server.body ?? "",
      isEnabled: server.isEnabled !== false,
    };
  }
  return drafts;
}

function isChannelDirty(template, draft, channel) {
  const server = template?.templates?.[channel];
  if (!server || !draft) return false;
  if ((draft.body ?? "") !== (server.body ?? "")) return true;
  if (channel === NOTIFICATION_CHANNELS.MAIL) {
    if ((draft.subject ?? "") !== (server.subject ?? "")) return true;
  }
  return Boolean(draft.isEnabled) !== Boolean(server.isEnabled);
}

export function NotificationTemplateEditPage({ type }) {
  const router = useRouter();
  const query = useAdminNotificationTemplateQuery(type);
  const template = query.data;

  const updateMutation = useUpdateNotificationTemplate();
  const resetMutation = useResetNotificationTemplate();
  const previewMutation = usePreviewNotificationTemplate();

  const [drafts, setDrafts] = useState(null);
  const [requestedChannel, setRequestedChannel] = useState(NOTIFICATION_CHANNELS.SMS);
  const [resetting, setResetting] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [saveErrors, setSaveErrors] = useState(null);

  const serverRef = useRef(null);
  const activeFieldRef = useRef(null);

  // Sunucudan gelen veri değiştiğinde (ilk yükleme, kaydetme, sıfırlama)
  // taslakları eşitle.
  useEffect(() => {
    if (!template) return;
    if (serverRef.current === template) return;
    serverRef.current = template;
    setDrafts(buildDrafts(template));
  }, [template]);

  // Seçili kanal bu bildirim tipinde yoksa desteklenen ilk kanala düş.
  const activeChannel = template?.channels?.includes(requestedChannel)
    ? requestedChannel
    : template?.channels?.[0] ?? NOTIFICATION_CHANNELS.SMS;

  const forbidden = isApiError(query.error) && query.error.status === 403;
  const notFound = isApiError(query.error) && query.error.status === 404;
  const networkError = isApiError(query.error) && query.error.status === 0;

  useEffect(() => {
    if (notFound) router.replace(NOTIFICATION_TEMPLATES_PATH);
  }, [notFound, router]);

  const dirtyChannels = useMemo(() => {
    if (!template || !drafts) return [];
    return template.channels.filter((channel) =>
      isChannelDirty(template, drafts[channel], channel)
    );
  }, [template, drafts]);

  const isDirty = dirtyChannels.length > 0;

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const currentDraft = drafts?.[activeChannel] ?? null;

  const updateDraft = useCallback(
    (channel, key, value) => {
      setSaveErrors(null);
      setDrafts((previous) => {
        if (!previous?.[channel]) return previous;
        return {
          ...previous,
          [channel]: { ...previous[channel], [key]: value },
        };
      });
    },
    []
  );

  const handleInsertVariable = (variable) => {
    const element = activeFieldRef.current;
    const key = element?.dataset?.draftKey;

    if (!element || !key || !currentDraft) {
      if (!currentDraft) return;
      const result = insertVariable(
        currentDraft.body,
        currentDraft.body.length,
        currentDraft.body.length,
        variable
      );
      updateDraft(activeChannel, "body", result.value);
      return;
    }

    const result = insertVariable(
      element.value,
      element.selectionStart,
      element.selectionEnd,
      variable
    );
    updateDraft(activeChannel, key, result.value);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(result.cursor, result.cursor);
    });
  };

  const runSave = () => {
    if (!template || !currentDraft) return;

    const payload = {
      body: currentDraft.body,
      is_enabled: currentDraft.isEnabled,
    };
    if (activeChannel === NOTIFICATION_CHANNELS.MAIL) {
      payload.subject = currentDraft.subject.trim() ? currentDraft.subject : null;
    }

    updateMutation.mutate(
      { type: template.type, channel: activeChannel, payload },
      {
        onSuccess: () => {
          toast.add({
            title: "Şablon kaydedildi",
            description: `${NOTIFICATION_CHANNEL_LABELS[activeChannel]} · ${template.label}`,
            type: "success",
          });
          setSaveErrors(null);
          setPendingSave(null);
        },
        onError: (error) => {
          setPendingSave(null);
          setSaveErrors(isApiError(error) ? error.errors ?? null : null);
          toast.add({
            title: "Şablon kaydedilemedi",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  const handleSave = () => {
    if (!currentDraft) return;
    const unknown = findUnknownVariables(
      activeChannel === NOTIFICATION_CHANNELS.MAIL
        ? [currentDraft.subject, currentDraft.body]
        : [currentDraft.body],
      template?.variables ?? []
    );

    if (unknown.length > 0) {
      setPendingSave(unknown);
      return;
    }
    runSave();
  };

  const handleReset = () => {
    if (!template) return;
    resetMutation.mutate(
      { type: template.type, channel: activeChannel },
      {
        onSuccess: () => {
          toast.add({
            title: "Şablon varsayılana döndürüldü",
            description: `${NOTIFICATION_CHANNEL_LABELS[activeChannel]} · ${template.label}`,
            type: "success",
          });
          setResetting(false);
        },
        onError: (error) => {
          setResetting(false);
          toast.add({
            title: "Varsayılana dönülemedi",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  const handlePreview = () => {
    if (!template) return;
    previewMutation.mutate(
      { type: template.type, variables: {} },
      {
        onSuccess: (data) => {
          setPreviewData(data);
          setPreviewOpen(true);
        },
        onError: (error) => {
          setPreviewData(null);
          toast.add({
            title: "Önizleme alınamadı",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  const handleBack = () => {
    if (isDirty) {
      setLeaving(true);
      return;
    }
    router.push(NOTIFICATION_TEMPLATES_PATH);
  };

  if (query.isPending) {
    return (
      <div className="w-full flex-1 px-4 py-6">
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (query.isError && !notFound) {
    return (
      <div className="w-full flex-1 px-4 py-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
          {forbidden ? (
            <ShieldAlert className="size-6 text-destructive" />
          ) : (
            <CircleAlert className="size-6 text-destructive" />
          )}
          <p className="text-sm text-muted-foreground">
            {forbidden
              ? "Bu alan için yetkiniz yok."
              : "Şablon yüklenemedi."}
          </p>
          {networkError && (
            <Button variant="outline" onClick={() => query.refetch()}>
              Tekrar Dene
            </Button>
          )}
          <Button variant="ghost" onClick={() => router.push(NOTIFICATION_TEMPLATES_PATH)}>
            Listeye dön
          </Button>
        </div>
      </div>
    );
  }

  if (!template || !drafts || !currentDraft) {
    return (
      <div className="w-full flex-1 px-4 py-6">
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const smsStats =
    activeChannel === NOTIFICATION_CHANNELS.SMS
      ? estimateSmsSegments(currentDraft.body)
      : null;

  const preview = previewData?.preview?.[activeChannel];
  const channels = template.channels;
  const activeIndex = dirtyChannels.includes(activeChannel);

  return (
    <div className="w-full flex-1 px-4 py-6">
      <button
        className="text-sm text-muted-foreground hover:text-foreground"
        onClick={handleBack}
        type="button"
      >
        ← Bildirim Şablonları
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{template.label}</h1>
        <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {template.audienceLabel}
        </span>
        {activeIndex && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            Kaydedilmemiş değişiklik
          </span>
        )}
      </div>
      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
        {template.type}
      </p>

      <div className="mt-5 rounded-xl border bg-card">
        <div className="flex flex-wrap gap-1 border-b p-2">
          {channels.map((channel) => (
            <button
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                channel === activeChannel
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
              key={channel}
              onClick={() => {
                setRequestedChannel(channel);
                activeFieldRef.current = null;
              }}
              type="button"
            >
              {NOTIFICATION_CHANNEL_LABELS[channel] ?? channel}
              {dirtyChannels.includes(channel) && (
                <span className="ml-1.5 inline-block size-1.5 rounded-full bg-amber-500 align-middle" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div>
            <p className="text-sm font-medium">Kullanılabilir değişkenler</p>
            <p className="mb-2 text-xs text-muted-foreground">
              Metne eklemek için bir değişkene tıklayın; imlecin olduğu yere
              eklenir.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {template.variables.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  Bu bildirim için değişken tanımlı değil.
                </span>
              )}
              {template.variables.map((variable) => (
                <button
                  className="inline-flex items-center gap-1 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
                  key={variable.key}
                  onClick={() => handleInsertVariable(variable.key)}
                  title={variable.label}
                  type="button"
                >
                  <span className="font-mono">{`{{ ${variable.key} }}`}</span>
                  <span className="text-muted-foreground">{variable.label}</span>
                </button>
              ))}
            </div>
          </div>

          {activeChannel === NOTIFICATION_CHANNELS.MAIL && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="template_subject">Konu</Label>
              <Input
                data-draft-key="subject"
                id="template_subject"
                onFocus={(event) => {
                  activeFieldRef.current = event.currentTarget;
                }}
                onChange={(event) =>
                  updateDraft(activeChannel, "subject", event.target.value)
                }
                placeholder="E-posta konusu"
                type="text"
                value={currentDraft.subject}
              />
              {saveErrors?.subject && (
                <p className="text-xs text-destructive">
                  {firstMessage(saveErrors.subject)}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="template_body">
              {activeChannel === NOTIFICATION_CHANNELS.SMS
                ? "SMS Metni"
                : "E-posta Gövdesi"}
            </Label>
            <Textarea
              className="min-h-40 font-mono text-sm"
              data-draft-key="body"
              id="template_body"
              onFocus={(event) => {
                activeFieldRef.current = event.currentTarget;
              }}
              onChange={(event) =>
                updateDraft(activeChannel, "body", event.target.value)
              }
              rows={activeChannel === NOTIFICATION_CHANNELS.SMS ? 5 : 12}
              value={currentDraft.body}
            />
            {activeChannel === NOTIFICATION_CHANNELS.SMS && smsStats && (
              <p className="text-xs text-muted-foreground">
                {smsStats.length} karakter ·{" "}
                {smsStats.segments === 0
                  ? "0 parça"
                  : `${smsStats.segments} parça (tahmini)`}
                {smsStats.segments > 1 &&
                  ` · ${smsStats.hasTurkish ? "Türkçe karakter nedeniyle 70" : "160"} karakterlik parçalar`}
              </p>
            )}
            {saveErrors?.body && (
              <p className="text-xs text-destructive">
                {firstMessage(saveErrors.body)}
              </p>
            )}
            {(saveErrors?.channel || saveErrors?.type) && (
              <p className="text-sm text-destructive">
                {firstMessage(saveErrors?.channel ?? saveErrors?.type)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="template_enabled">Şablon aktif</Label>
              <p className="text-xs text-muted-foreground">
                Pasif şablonlar gönderilmez.
              </p>
            </div>
            <Switch
              checked={currentDraft.isEnabled}
              id="template_enabled"
              onCheckedChange={(checked) =>
                updateDraft(activeChannel, "isEnabled", checked)
              }
            />
          </div>

          {template.templates[activeChannel]?.isDefault && (
            <p className="text-xs text-muted-foreground">
              Bu kanal için özelleştirme yok; kod içindeki varsayılan şablon
              kullanılıyor.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              disabled={previewMutation.isPending}
              onClick={handlePreview}
              type="button"
              variant="outline"
            >
              {previewMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Eye className="size-4" />
              )}
              Önizleme
            </Button>
            <Button
              disabled={resetMutation.isPending}
              onClick={() => setResetting(true)}
              type="button"
              variant="outline"
            >
              {resetMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RotateCcw className="size-4" />
              )}
              Varsayılana Dön
            </Button>
            <Button
              className="h-10"
              disabled={updateMutation.isPending}
              onClick={handleSave}
              type="button"
            >
              {updateMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </div>

      {/* Bilinmeyen değişken uyarısı */}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setPendingSave(null);
        }}
        open={Boolean(pendingSave)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bilinmeyen değişkenler</AlertDialogTitle>
            <AlertDialogDescription>
              Şablonda, değişken listesinde bulunmayan yer tutucular var:{" "}
              <span className="font-mono">
                {(pendingSave ?? []).map((key) => `{{ ${key} }}`).join(", ")}
              </span>
              . Bu değişkenler gönderimde boş kalabilir. Yine de kaydetmek
              istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={updateMutation.isPending}
              onClick={runSave}
            >
              Yine de Kaydet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Varsayılana dön onayı */}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setResetting(false);
        }}
        open={resetting}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Varsayılana dön</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{template.label}&quot; bildiriminin{" "}
              {NOTIFICATION_CHANNEL_LABELS[activeChannel]} şablonundaki
              özelleştirmeler silinecek ve kod içindeki varsayılan şablon
              kullanılacak. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={resetMutation.isPending}
              onClick={handleReset}
              variant="destructive"
            >
              {resetMutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {resetMutation.isPending ? "Dönülüyor..." : "Varsayılana Dön"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Kaydedilmemiş değişiklikten ayrılma onayı */}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setLeaving(false);
        }}
        open={leaving}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kaydedilmemiş değişiklikler</AlertDialogTitle>
            <AlertDialogDescription>
              Bu sayfada kaydedilmemiş değişiklikleriniz var. Ayrılırsanız
              değişiklikler kaybolacak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Sayfada kal</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              onClick={() => {
                setLeaving(false);
                router.push(NOTIFICATION_TEMPLATES_PATH);
              }}
              variant="destructive"
            >
              Değişiklikleri bırak
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Önizleme */}
      <Dialog onOpenChange={setPreviewOpen} open={previewOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Önizleme · {NOTIFICATION_CHANNEL_LABELS[activeChannel]}
            </DialogTitle>
            <DialogDescription>
              {template.label} · değişkenler {`{{ degisken }}`} biçiminde
              örnek değerlerle dolduruldu.
            </DialogDescription>
          </DialogHeader>

          {!preview ? (
            <p className="text-sm text-destructive">
              Önizleme içeriği alınamadı. Lütfen tekrar deneyin.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {preview.subject !== null && preview.subject !== undefined && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Konu
                  </span>
                  <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                    {preview.subject || "—"}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  İçerik
                </span>
                <pre className="max-h-[50vh] overflow-auto rounded-lg border bg-muted/40 px-3 py-2 text-sm whitespace-pre-wrap">
                  {preview.body || "—"}
                </pre>
              </div>
              {!preview.isEnabled && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Bu kanaldaki şablon pasif durumda; önizleme yine de
                  gösteriliyor.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)} type="button">
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
