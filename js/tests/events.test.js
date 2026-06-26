import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyEvents, getBaseEventStatus, getRaceEndTime } from "../events.js";

/** @param {string} iso */
function d(iso) {
  return new Date(iso);
}

/** @returns {import('../api.js').RaceEvent} */
function makeEvent(round, sessions) {
  return {
    round: String(round),
    raceName: `GP ${round}`,
    circuitName: "Circuit",
    locality: "City",
    country: "Country",
    sessions,
  };
}

describe("getRaceEndTime", () => {
  it("returns race start plus duration", () => {
    const event = makeEvent(1, [
      { key: "Race", name: "Race", startUtc: d("2025-03-16T04:00:00Z") },
    ]);
    const end = getRaceEndTime(event);
    assert.equal(end?.toISOString(), "2025-03-16T06:00:00.000Z");
  });

  it("returns null when race session is missing", () => {
    const event = makeEvent(1, [
      { key: "Qualifying", name: "Qualifying", startUtc: d("2025-03-15T05:00:00Z") },
    ]);
    assert.equal(getRaceEndTime(event), null);
  });
});

describe("getBaseEventStatus", () => {
  it("marks finished races as past using last session when race is missing", () => {
    const event = makeEvent(1, [
      { key: "Qualifying", name: "Qualifying", startUtc: d("2020-01-01T12:00:00Z") },
    ]);
    assert.equal(getBaseEventStatus(event, d("2025-01-01T00:00:00Z")), "past");
  });

  it("marks in-progress weekends as active", () => {
    const event = makeEvent(1, [
      { key: "FirstPractice", name: "FirstPractice", startUtc: d("2025-06-01T10:00:00Z") },
      { key: "Race", name: "Race", startUtc: d("2025-06-03T14:00:00Z") },
    ]);
    assert.equal(getBaseEventStatus(event, d("2025-06-01T11:00:00Z")), "active");
  });
});

describe("classifyEvents", () => {
  it("marks only the first non-past event as next", () => {
    const events = [
      makeEvent(1, [{ key: "Race", name: "Race", startUtc: d("2020-01-01T14:00:00Z") }]),
      makeEvent(2, [{ key: "Race", name: "Race", startUtc: d("2030-01-01T14:00:00Z") }]),
      makeEvent(3, [{ key: "Race", name: "Race", startUtc: d("2030-02-01T14:00:00Z") }]),
    ];

    const classified = classifyEvents(events, d("2025-01-01T00:00:00Z"));
    assert.deepEqual(
      classified.map((item) => item.status),
      ["past", "next", "upcoming"],
    );
  });
});
