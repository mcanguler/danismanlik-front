import { ApiError } from "./api";

export function getQueryErrorMessage(
  error,
  fallback = "Beklenmeyen bir hata oluştu"
) {
  if (!(error instanceof ApiError)) return fallback;
  if (error.status === 401)
    return "Oturumunuz sona erdi, lütfen tekrar giriş yapın.";
  if (error.status === 403) return "Bu içeriği görüntüleme yetkiniz yok.";
  if (error.status === 404) return "Kayıt bulunamadı.";
  if (error.status === 0) return error.message;
  return error.message || `İstek başarısız (${error.status})`;
}
