import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { MIN_YEAR, STATS_LOOKBACK_YEARS } from "../constants.js";
import {
  formatLapTime,
  fetchCircuitRaceStats,
  fetchStatsForEvent,
  getStatsLookbackMinYear,
  resetStatsState,
} from "../raceStats.js";

const originalFetch = globalThis.fetch;

/** @type {import("../api.js").RaceEvent} */
const silverstoneEvent = {
  round: "9",
  raceName: "British Grand Prix",
  circuitName: "Silverstone Circuit",
  locality: "Silverstone",
  country: "UK",
  circuitId: "silverstone",
  sessions: [],
};

/**
 * @param {number} season
 * @param {string} circuitId
 * @param {string} givenName
 * @param {string} familyName
 */
function racePayload(season, circuitId, givenName, familyName) {
  return {
    MRData: {
      RaceTable: {
        Races: [
          {
            season: String(season),
            Circuit: { circuitId },
            Results: [
              {
                Driver: { givenName, familyName },
                laps: "52",
                Time: { millis: "5720000" },
              },
            ],
          },
        ],
      },
    },
  };
}

/**
 * @param {number} status
 * @param {unknown} [body]
 */
function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  resetStatsState();
});

describe("formatLapTime", () => {
  it("formats sub-minute laps", () => {
    assert.equal(formatLapTime(83456), "1:23.456");
  });

  it("pads seconds to three decimals", () => {
    assert.equal(formatLapTime(60050), "1:00.050");
  });

  it("formats multi-minute laps", () => {
    assert.equal(formatLapTime(1938700), "32:18.700");
  });
});

describe("getStatsLookbackMinYear", () => {
  it("limits lookback to STATS_LOOKBACK_YEARS", () => {
    assert.equal(getStatsLookbackMinYear(2026), 2026 - STATS_LOOKBACK_YEARS + 1);
  });

  it("never goes below MIN_YEAR", () => {
    assert.equal(getStatsLookbackMinYear(MIN_YEAR + 2), MIN_YEAR);
  });
});

describe("fetchStatsForEvent", () => {
  beforeEach(() => {
    resetStatsState();
  });

  it("returns null when circuitId is empty", async () => {
    const stats = await fetchStatsForEvent(
      { ...silverstoneEvent, circuitId: "" },
      2026,
      false,
    );
    assert.equal(stats, null);
    assert.equal(globalThis.fetch, originalFetch);
  });

  it("upcoming race uses previous season circuit results", async () => {
    globalThis.fetch = async (url) => {
      if (url.includes("/2025/circuits/silverstone/")) {
        return jsonResponse(200, racePayload(2025, "silverstone", "Lando", "Norris"));
      }
      return jsonResponse(404, {});
    };

    const stats = await fetchStatsForEvent(silverstoneEvent, 2026, false);
    assert.equal(stats?.winnerName, "Lando Norris");
    assert.equal(stats?.winnerYear, 2025);
  });

  it("past race prefers current season round results", async () => {
    globalThis.fetch = async (url) => {
      if (url.includes("/2026/9/results.json")) {
        return jsonResponse(200, racePayload(2026, "silverstone", "Max", "Verstappen"));
      }
      if (url.includes("/2026/circuits/silverstone/")) {
        return jsonResponse(200, racePayload(2025, "silverstone", "Lando", "Norris"));
      }
      return jsonResponse(404, {});
    };

    const stats = await fetchStatsForEvent(silverstoneEvent, 2026, true);
    assert.equal(stats?.winnerName, "Max Verstappen");
    assert.equal(stats?.winnerYear, 2026);
  });

  it("continues to older years when recent year has no results", async () => {
    globalThis.fetch = async (url) => {
      if (url.includes("/2025/circuits/imola/")) {
        return jsonResponse(200, {
          MRData: { RaceTable: { Races: [] } },
        });
      }
      if (url.includes("/2024/circuits/imola/")) {
        return jsonResponse(200, racePayload(2024, "imola", "Max", "Verstappen"));
      }
      return jsonResponse(404, {});
    };

    const stats = await fetchStatsForEvent(
      { ...silverstoneEvent, circuitId: "imola", round: "7" },
      2026,
      false,
    );
    assert.equal(stats?.winnerName, "Max Verstappen");
    assert.equal(stats?.winnerYear, 2024);
  });

  it("continues lookback after transient network errors", async () => {
    globalThis.fetch = async (url) => {
      if (url.includes("/2025/circuits/silverstone/")) {
        throw new Error("network down");
      }
      if (url.includes("/2024/circuits/silverstone/")) {
        return jsonResponse(200, racePayload(2024, "silverstone", "Lewis", "Hamilton"));
      }
      return jsonResponse(404, {});
    };

    const stats = await fetchStatsForEvent(silverstoneEvent, 2026, false);
    assert.equal(stats?.winnerName, "Lewis Hamilton");
    assert.equal(stats?.winnerYear, 2024);
  });

  it("does not fall back to stale years beyond lookback window", async () => {
    const minYear = getStatsLookbackMinYear(2025);
    const calls = [];

    globalThis.fetch = async (url) => {
      calls.push(url);
      if (url.includes(`/${minYear}/circuits/silverstone/`)) {
        return jsonResponse(200, racePayload(minYear, "silverstone", "Old", "Winner"));
      }
      return jsonResponse(404, {});
    };

    const stats = await fetchStatsForEvent(silverstoneEvent, 2026, false);
    assert.equal(stats?.winnerName, "Old Winner");
    assert.equal(
      calls.some((url) => url.includes(`/${minYear - 1}/circuits/silverstone/`)),
      false,
    );
  });
});

describe("fetchCircuitRaceStats", () => {
  beforeEach(() => {
    resetStatsState();
  });

  it("deduplicates in-flight requests for the same cache key", async () => {
    let fetchCount = 0;

    globalThis.fetch = async () => {
      fetchCount += 1;
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
      return jsonResponse(200, racePayload(2025, "silverstone", "Lando", "Norris"));
    };

    const [first, second] = await Promise.all([
      fetchCircuitRaceStats(2025, "silverstone"),
      fetchCircuitRaceStats(2025, "silverstone"),
    ]);

    assert.equal(fetchCount, 1);
    assert.equal(first?.winnerName, "Lando Norris");
    assert.equal(second?.winnerName, "Lando Norris");
  });

  it("caches JSON parse failures as misses", async () => {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("invalid json");
      },
    });

    const first = await fetchCircuitRaceStats(2025, "silverstone");
    assert.equal(first, null);

    let fetchCount = 0;
    globalThis.fetch = async () => {
      fetchCount += 1;
      return jsonResponse(200, racePayload(2025, "silverstone", "Lando", "Norris"));
    };

    const second = await fetchCircuitRaceStats(2025, "silverstone");
    assert.equal(second, null);
    assert.equal(fetchCount, 0);
  });
});
