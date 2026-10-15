import { isApiError } from "./query-errors";

const GENERIC_MESSAGE = "Beklenmeyen bir hata oluştu";

/**
 * API hatalarını forma tek yerde yansıtır.
 *
 * - Bilinen alanlara ait hatalar alan altına yazılır.
 * - Alan altı hata varsa genel mesaj tekrar gösterilmez (tekrar önlenir).
 * - Alan altı hata yoksa genel mesaj form altına (root) yazılır.
 *
 * @returns {string} gösterilen birincil mesaj
 */
export function applyApiErrorToForm(form, error, fieldNames = []) {
  if (!isApiError(error)) {
    form.setError("root", { message: GENERIC_MESSAGE });
    return GENERIC_MESSAGE;
  }

  let fieldMessage = null;

  for (const [field, messages] of Object.entries(error.errors ?? {})) {
    if (!fieldNames.includes(field)) continue;
    const message = Array.isArray(messages) ? messages[0] : messages;
    if (!message) continue;
    form.setError(field, { message });
    if (fieldMessage === null) fieldMessage = message;
  }

  if (fieldMessage !== null) {
    return fieldMessage;
  }

  const message = error.message || GENERIC_MESSAGE;
  form.setError("root", { message });
  return message;
}
