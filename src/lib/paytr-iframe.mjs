// PayTR iFrame ödeme ekranı URL'si (saf fonksiyonlar).
//
// PayTR'ın gömülebilir ödeme ekranı yolu /odeme/guvenli/{token}'dir ve bu
// yanıt frame-ancestors/X-Frame-Options göndermez. Eski /odeme/iframe/{token}
// yolu ise paytr.com köküne 302 yönlendirir; kök yanıtı "frame-ancestors
// 'self'" gönderdiği için tarayıcı iframe'i engeller.

export const PAYTR_IFRAME_BASE = "https://www.paytr.com/odeme/guvenli/";

/**
 * Backend'den gelen iframe URL'sini doğrular; geçersizse token ile doğru
 * (gömülebilir) URL'yi yeniden kurar.
 *
 * @param {string} token
 * @param {string} iframeUrl
 * @returns {string|null}
 */
export function resolvePaytrIframeUrl(token, iframeUrl) {
  const normalizedToken = typeof token === "string" ? token.trim() : "";
  const url = typeof iframeUrl === "string" ? iframeUrl.trim() : "";

  const isEmbeddable =
    url !== "" &&
    !url.includes("/odeme/iframe/") &&
    !/^https?:\/\/(www\.)?paytr\.com\/?$/.test(url);

  if (isEmbeddable) return url;
  if (normalizedToken) return `${PAYTR_IFRAME_BASE}${normalizedToken}`;
  return url || null;
}
