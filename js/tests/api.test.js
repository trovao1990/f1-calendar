import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseUtcDateTime } from "../api.js";

describe("parseUtcDateTime", () => {
  it("parses valid UTC date and time", () => {
    const parsed = parseUtcDateTime("2025-03-16", "04:00:00Z");
    assert.equal(parsed?.toISOString(), "2025-03-16T04:00:00.000Z");
  });

  it("returns null for invalid dates", () => {
    assert.equal(parseUtcDateTime("not-a-date", "04:00:00Z"), null);
  });

  it("defaults missing time to midnight UTC", () => {
    const parsed = parseUtcDateTime("2025-03-16");
    assert.equal(parsed?.toISOString(), "2025-03-16T00:00:00.000Z");
  });
});
