import test from "node:test";
import assert from "node:assert/strict";

import {
  estimateSmsSegments,
  findUnknownVariables,
  insertVariable,
} from "./notification-template-utils.mjs";

test("estimateSmsSegments: boş metin sıfır parça", () => {
  const result = estimateSmsSegments("");
  assert.equal(result.length, 0);
  assert.equal(result.segments, 0);
});

test("estimateSmsSegments: ASCII metin 160'lık parçalara bölünür", () => {
  const result = estimateSmsSegments("a".repeat(160));
  assert.equal(result.hasTurkish, false);
  assert.equal(result.single, 160);
  assert.equal(result.segments, 1);

  const long = estimateSmsSegments("a".repeat(161));
  assert.equal(long.segments, 2);
});

test("estimateSmsSegments: Türkçe karakterde 70'lik parçalar kullanılır", () => {
  const result = estimateSmsSegments("ş".repeat(71));
  assert.equal(result.hasTurkish, true);
  assert.equal(result.single, 70);
  assert.equal(result.segments, 2);
});

test("findUnknownVariables: bilinmeyenleri döner, bilinenleri atlar", () => {
  const unknown = findUnknownVariables(
    ["Merhaba {{ customer_name }}", "Tutar {{ order_total }} / {{ yok }}"],
    [{ key: "customer_name" }, { key: "order_total" }]
  );
  assert.deepEqual(unknown, ["yok"]);
});

test("findUnknownVariables: boşluklu yazım ve tekrarı normalize eder", () => {
  const unknown = findUnknownVariables("{{ x }} {{  x  }} {{y}}", []);
  assert.deepEqual(unknown, ["x", "y"]);
});

test("insertVariable: imleç konumuna yer tutucu ekler", () => {
  const result = insertVariable("Merhaba ,", 8, 8, "customer_name");
  assert.equal(result.value, "Merhaba {{ customer_name }},");
  assert.equal(result.cursor, 8 + "{{ customer_name }}".length);
});

test("insertVariable: seçili metni değiştirir", () => {
  const result = insertVariable("Merhaba AD,", 8, 10, "customer_name");
  assert.equal(result.value, "Merhaba {{ customer_name }},");
});

test("insertVariable: imleç yoksa sona ekler", () => {
  const result = insertVariable("abc", null, null, "order_no");
  assert.equal(result.value, "abc{{ order_no }}");
});
