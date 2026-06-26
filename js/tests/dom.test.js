import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { escapeAttr, escapeHtml } from "../dom.js";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    assert.equal(escapeHtml(`<script>"x"&'`), "&lt;script&gt;&quot;x&quot;&amp;&#39;");
  });
});

describe("escapeAttr", () => {
  it("escapes attribute values", () => {
    assert.equal(escapeAttr(`"onload=alert(1)"`), "&quot;onload=alert(1)&quot;");
  });
});
