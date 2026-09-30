import { ApiError } from "./api";

/**
 * `instanceof` farklı modül kopyalarında başarısız olabildiği için
 * ApiError'ı hem sınıf hem de şekil (duck-typing) üzerinden doğrularız.
 * Böylece gerçek API hata mesajları generic metinle maskelenmez.
 */
export function isApiError(error) {
  if (error instanceof ApiError) return true;
  return Boolean(
    error &&
      typeof error === "object" &&
      (error.name === "ApiError" || typeof error.status === "number")
  );
}

export function getQueryErrorMessage(
  error,
  fallback = "Beklenmeyen bir hata oluştu"
) {
  if (!isApiError(error)) return fallback;
  if (error.status === 401)
    return "Oturumunuz sona erdi, lütfen tekrar giriş yapın.";
  if (error.status === 403) return "Bu içeriği görüntüleme yetkiniz yok.";
  if (error.status === 404) return "Kayıt bulunamadı.";
  if (error.status === 0) return error.message;
  return error.message || `İstek başarısız (${error.status})`;
}
