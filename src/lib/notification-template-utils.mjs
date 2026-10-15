// Bildirim şablonu yardımcıları (saf fonksiyonlar).
// React/Next bağımlılığı yoktur; bu sayede node:test ile doğrudan test edilebilir.

/** Türkçe'ye özgü (GSM-7 dışı) karakterler. */
const NON_GSM7_CHARS = /[çÇğĞıİöÖşŞüÜ]/;

/** Backend TemplateRenderer ile aynı yer tutucu deseni. */
const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

/** API'nin kabul ettiği kanal değerleri (küçük harf). */
export const CHANNEL_VALUES = ["sms", "mail"];

/**
 * Kanal değerini küçük harfe indirip doğrular.
 * API kanalları küçük harfle döndürür; yazma uçları büyük/küçük harfe duyarsızdır.
 * @returns {"sms"|"mail"|null}
 */
export function normalizeChannelValue(value) {
  const channel = String(value ?? "").trim().toLowerCase();
  return CHANNEL_VALUES.includes(channel) ? channel : null;
}

/**
 * SMS metnini tahmini olarak parçalara böler.
 * Türkçe karakter yoksa 160 (çok parçalı 153), varsa 70 (çok parçalı 67)
 * karakterlik parçalar kullanılır.
 */
export function estimateSmsSegments(text) {
  const value = typeof text === "string" ? text : "";
  const length = value.length;
  const hasTurkish = NON_GSM7_CHARS.test(value);
  const single = hasTurkish ? 70 : 160;
  const multi = hasTurkish ? 67 : 153;
  const segments =
    length === 0 ? 0 : length <= single ? 1 : Math.ceil(length / multi);
  return { length, hasTurkish, single, multi, segments };
}

/**
 * Metinde geçen ancak bilinen değişken listesinde olmayan yer tutucuları döner.
 * @param {string|string[]} text
 * @param {Array<string|{key:string}>} variables
 */
export function findUnknownVariables(text, variables = []) {
  const known = new Set(
    variables
      .map((variable) =>
        typeof variable === "string" ? variable : variable?.key
      )
      .filter(Boolean)
  );

  const values = Array.isArray(text) ? text : [text];
  const unknown = new Set();

  for (const value of values) {
    if (typeof value !== "string" || value === "") continue;
    PLACEHOLDER_PATTERN.lastIndex = 0;
    let match;
    while ((match = PLACEHOLDER_PATTERN.exec(value)) !== null) {
      if (!known.has(match[1])) unknown.add(match[1]);
    }
  }

  return [...unknown];
}

/**
 * `{{ degisken }}` yer tutucusunu imlecin bulunduğu konuma ekler.
 * @returns {{ value: string, cursor: number }}
 */
export function insertVariable(value, selectionStart, selectionEnd, variable) {
  const source = typeof value === "string" ? value : "";
  const token = `{{ ${variable} }}`;
  const start = Number.isInteger(selectionStart)
    ? Math.min(Math.max(selectionStart, 0), source.length)
    : source.length;
  const end = Number.isInteger(selectionEnd)
    ? Math.min(Math.max(selectionEnd, start), source.length)
    : start;

  return {
    value: source.slice(0, start) + token + source.slice(end),
    cursor: start + token.length,
  };
}
