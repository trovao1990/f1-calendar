import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyLanguage, detectBrowserLanguage, t } from "../i18n.js";

describe("detectBrowserLanguage", () => {
  it("returns a supported language id", () => {
    const lang = detectBrowserLanguage();
    assert.match(lang, /^(pt|en|fr|es)$/);
  });
});

describe("t", () => {
  it("interpolates placeholders", () => {
    applyLanguage("en");
    assert.equal(t("seasonLoaded", { count: 24, year: 2025 }), "24 Grands Prix — 2025 season");
  });

  it("falls back to English for unknown keys", () => {
    applyLanguage("pt");
    assert.equal(t("nonexistent_key_xyz"), "nonexistent_key_xyz");
  });
});
