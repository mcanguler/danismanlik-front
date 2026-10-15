import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";
import {
  CHANNEL_VALUES,
  normalizeChannelValue,
} from "./notification-template-utils.mjs";

export const notificationTemplatesQueryKey = ["notification-templates"];

/** Backend enum değerleri (NotificationAudience). */
export const NOTIFICATION_AUDIENCES = {
  CUSTOMER: "CUSTOMER",
  CONSULTANT: "CONSULTANT",
  ADMIN: "ADMIN",
};

/** API kanal değerleri (NotificationTemplateResource küçük harfe çevirir). */
export const NOTIFICATION_CHANNELS = {
  SMS: "sms",
  MAIL: "mail",
};

export const NOTIFICATION_CHANNEL_VALUES = CHANNEL_VALUES;

export const NOTIFICATION_AUDIENCE_LABELS = {
  [NOTIFICATION_AUDIENCES.CUSTOMER]: "Müşteri",
  [NOTIFICATION_AUDIENCES.CONSULTANT]: "Danışman",
  [NOTIFICATION_AUDIENCES.ADMIN]: "Yönetici",
};

export const NOTIFICATION_CHANNEL_LABELS = {
  [NOTIFICATION_CHANNELS.SMS]: "SMS",
  [NOTIFICATION_CHANNELS.MAIL]: "E-posta",
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeTemplateChannel(item) {
  if (!item || typeof item !== "object") return null;
  return {
    channel: normalizeChannelValue(item.channel) ?? "",
    channelLabel: item.channel_label ?? "",
    subject: item.subject ?? "",
    body: item.body ?? "",
    isEnabled: item.is_enabled !== false,
    isDefault: Boolean(item.is_default),
  };
}

export function normalizeNotificationTemplate(item) {
  if (!item || typeof item !== "object") return null;

  const templates = {};
  for (const [key, value] of Object.entries(item.templates ?? {})) {
    const normalized = normalizeTemplateChannel(value);
    if (!normalized) continue;
    const channel = normalized.channel || normalizeChannelValue(key);
    if (!channel) continue;
    templates[channel] = { ...normalized, channel };
  }

  const variables = asArray(item.variables)
    .map((variable) => ({
      key: variable?.key ?? "",
      label: variable?.label ?? "",
      placeholder: variable?.placeholder ?? `{{ ${variable?.key ?? ""} }}`,
    }))
    .filter((variable) => variable.key);

  const channels = asArray(item.channels)
    .map((channel) => normalizeChannelValue(channel))
    .filter(Boolean);

  return {
    type: item.type ?? "",
    label: item.label ?? item.type ?? "",
    audience: item.audience ?? "",
    audienceLabel:
      item.audience_label ??
      NOTIFICATION_AUDIENCE_LABELS[item.audience] ??
      item.audience ??
      "",
    channels,
    variables,
    templates,
    isCustomized: Object.values(templates).some((template) => !template.isDefault),
  };
}

export function normalizeNotificationTemplateDetail(payload) {
  const item = payload?.data ?? payload;
  const normalized = normalizeNotificationTemplate(item);
  if (!normalized || !normalized.type) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return normalized;
}

function normalizeNotificationTemplateList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeNotificationTemplate).filter(Boolean);
}

export function normalizeNotificationPreview(payload) {
  const data = payload?.data ?? payload;
  if (!data || typeof data !== "object" || !data.preview) {
    throw new ApiError("Önizleme yanıtı okunamadı");
  }

  const preview = {};
  for (const [channel, value] of Object.entries(data.preview ?? {})) {
    preview[channel] = {
      subject: value?.subject ?? null,
      body: value?.body ?? "",
      isEnabled: value?.is_enabled !== false,
    };
  }

  return {
    type: data.type ?? "",
    label: data.label ?? "",
    variables: data.variables ?? {},
    preview,
  };
}

function useToken() {
  return useAuthStore((state) => state.token);
}

export function notificationTemplateDetailQueryKey(type) {
  return [...notificationTemplatesQueryKey, "detail", String(type)];
}

export function useAdminNotificationTemplatesQuery(filters = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...notificationTemplatesQueryKey, "list", filters],
    queryFn: async () =>
      normalizeNotificationTemplateList(
        await api.adminNotificationTemplates(token, filters)
      ),
    enabled: options.enabled !== false && Boolean(token),
  });
}

export function useAdminNotificationTemplateQuery(type, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: notificationTemplateDetailQueryKey(type),
    queryFn: async () =>
      normalizeNotificationTemplateDetail(
        await api.adminNotificationTemplate(token, type)
      ),
    enabled: options.enabled !== false && Boolean(token && type),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ type, channel, payload }) =>
      api.updateNotificationTemplate(token, type, channel, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationTemplatesQueryKey });
    },
  });
}

export function useResetNotificationTemplate() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ type, channel }) =>
      api.resetNotificationTemplate(token, type, channel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationTemplatesQueryKey });
    },
  });
}

export function usePreviewNotificationTemplate() {
  const token = useToken();

  return useMutation({
    mutationFn: async ({ type, variables }) =>
      normalizeNotificationPreview(
        await api.previewNotificationTemplate(token, type, { variables })
      ),
  });
}
