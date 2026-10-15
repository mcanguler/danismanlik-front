import test from "node:test";
import assert from "node:assert/strict";

import {
  PAYTR_IFRAME_BASE,
  resolvePaytrIframeUrl,
} from "./paytr-iframe.mjs";

test("resolvePaytrIframeUrl: doğru /odeme/guvenli URL'sini korur", () => {
  const url = "https://www.paytr.com/odeme/guvenli/abc123";
  assert.equal(resolvePaytrIframeUrl("abc123", url), url);
});

test("resolvePaytrIframeUrl: eski /odeme/iframe yolunu token ile düzeltir", () => {
  assert.equal(
    resolvePaytrIframeUrl(
      "abc123",
      "https://www.paytr.com/odeme/iframe/abc123"
    ),
    `${PAYTR_IFRAME_BASE}abc123`
  );
});

test("resolvePaytrIframeUrl: paytr.com kökünü token ile düzeltir", () => {
  assert.equal(
    resolvePaytrIframeUrl("abc123", "https://www.paytr.com/"),
    `${PAYTR_IFRAME_BASE}abc123`
  );
});

test("resolvePaytrIframeUrl: boş/eksik URL'de token ile kurar", () => {
  assert.equal(resolvePaytrIframeUrl("abc123", ""), `${PAYTR_IFRAME_BASE}abc123`);
  assert.equal(resolvePaytrIframeUrl("abc123", undefined), `${PAYTR_IFRAME_BASE}abc123`);
});

test("resolvePaytrIframeUrl: token yoksa mevcut URL'yi döner, yoksa null", () => {
  assert.equal(
    resolvePaytrIframeUrl("", "https://example.com/odeme"),
    "https://example.com/odeme"
  );
  assert.equal(resolvePaytrIframeUrl("", ""), null);
});
