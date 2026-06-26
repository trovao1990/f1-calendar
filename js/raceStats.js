import { API_BASE, MIN_YEAR, STATS_LOOKBACK_YEARS } from "./constants.js";
import { getCircuitLapCount } from "./circuits.js";

/**
 * @typedef {Object} RaceStats
 * @property {string} winnerName
 * @property {number} winnerYear
 * @property {number | null} laps
 * @property {number | null} avgLapMs
 * @property {string | null} avgLapTime
 */

/** @type {Map<string, RaceStats | "miss">} */
const statsCache = new Map();

/** @type {Map<string, Promise<RaceStats | null>>} */
const pendingFetches = new Map();

const STATS_CONCURRENCY = 4;
const FETCH_RETRIES = 2;

const IS_TEST =
  typeof process !== "undefined" && process.env?.NODE_ENV === "test";

/**
 * @param {string} message
 * @param {Record<string, unknown>} [context]
 */
function debugStats(message, context) {
  if (IS_TEST) return;
  console.debug("[raceStats]", message, context ?? "");
}

/**
 * Limpa cache e requisições em voo (usado em testes e ao recarregar temporada).
 */
export function resetStatsState() {
  statsCache.clear();
  pendingFetches.clear();
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * @param {number} millis
 * @returns {string}
 */
export function formatLapTime(millis) {
  const totalSeconds = millis / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

/**
 * @param {Record<string, unknown>} race
 * @returns {RaceStats | null}
 */
function parseRaceStats(race) {
  const winner = race.Results?.[0];
  if (!winner) return null;

  const laps = Number(winner.laps) || getCircuitLapCount(race.Circuit?.circuitId) || null;
  const millis = winner.Time?.millis ? Number(winner.Time.millis) : null;
  const avgLapMs = millis && laps && laps > 0 ? millis / laps : null;

  return {
    winnerName: `${winner.Driver.givenName} ${winner.Driver.familyName}`,
    winnerYear: Number(race.season),
    laps,
    avgLapMs,
    avgLapTime: avgLapMs ? formatLapTime(avgLapMs) : null,
  };
}

/**
 * @param {Record<string, unknown> | undefined} race
 * @param {string} [expectedCircuitId]
 * @returns {RaceStats | null}
 */
function parseRaceResult(race, expectedCircuitId) {
  if (!race?.Results?.[0]) return null;
  if (expectedCircuitId && race.Circuit?.circuitId !== expectedCircuitId) return null;
  return parseRaceStats(race);
}

/**
 * @param {string} url
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url) {
  let lastError = null;

  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url);

      if (response.ok || response.status === 404) {
        return response;
      }

      if (attempt < FETCH_RETRIES && (response.status === 429 || response.status >= 500)) {
        await delay(300 * (attempt + 1));
        continue;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_RETRIES) {
        await delay(300 * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Request failed");
}

/**
 * @param {string} cacheKey
 * @param {() => Promise<RaceStats | null>} loader
 * @returns {Promise<RaceStats | null>}
 */
async function fetchCachedStats(cacheKey, loader) {
  if (statsCache.has(cacheKey)) {
    const cached = statsCache.get(cacheKey);
    return cached === "miss" ? null : cached ?? null;
  }

  const inFlight = pendingFetches.get(cacheKey);
  if (inFlight) return inFlight;

  const promise = loader()
    .then((result) => {
      pendingFetches.delete(cacheKey);
      return result;
    })
    .catch((error) => {
      pendingFetches.delete(cacheKey);
      throw error;
    });

  pendingFetches.set(cacheKey, promise);
  return promise;
}

/**
 * @param {Response} response
 * @param {string} cacheKey
 * @param {string} [expectedCircuitId]
 * @returns {Promise<RaceStats | null>}
 */
async function parseStatsResponse(response, cacheKey, expectedCircuitId) {
  if (response.status === 404) {
    statsCache.set(cacheKey, "miss");
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    debugStats("JSON parse failed", { cacheKey, error });
    statsCache.set(cacheKey, "miss");
    return null;
  }

  const stats = parseRaceResult(data?.MRData?.RaceTable?.Races?.[0], expectedCircuitId);
  statsCache.set(cacheKey, stats ?? "miss");
  return stats;
}

/**
 * @param {number} year
 * @param {string} circuitId
 * @returns {Promise<RaceStats | null>}
 */
export async function fetchCircuitRaceStats(year, circuitId) {
  if (!circuitId) return null;

  const cacheKey = `circuit:${year}:${circuitId}`;

  return fetchCachedStats(cacheKey, async () => {
    try {
      const response = await fetchWithRetry(
        `${API_BASE}/${year}/circuits/${circuitId}/results.json`,
      );
      return parseStatsResponse(response, cacheKey, circuitId);
    } catch (error) {
      debugStats("circuit fetch failed", { cacheKey, error });
      throw error;
    }
  });
}

/**
 * @param {number} year
 * @param {string} round
 * @param {string} circuitId
 * @returns {Promise<RaceStats | null>}
 */
export async function fetchRoundRaceStats(year, round, circuitId) {
  if (!circuitId) return null;

  const cacheKey = `round:${year}:${round}:${circuitId}`;

  return fetchCachedStats(cacheKey, async () => {
    try {
      const response = await fetchWithRetry(`${API_BASE}/${year}/${round}/results.json`);
      return parseStatsResponse(response, cacheKey, circuitId);
    } catch (error) {
      debugStats("round fetch failed", { cacheKey, error });
      throw error;
    }
  });
}

/**
 * @param {number} startYear
 * @returns {number}
 */
export function getStatsLookbackMinYear(startYear) {
  return Math.max(MIN_YEAR, startYear - STATS_LOOKBACK_YEARS + 1);
}

/**
 * @param {import('./api.js').RaceEvent} event
 * @param {number} seasonYear
 * @param {boolean} isPast
 * @returns {Promise<RaceStats | null>}
 */
export async function fetchStatsForEvent(event, seasonYear, isPast) {
  if (!event.circuitId) return null;

  if (isPast) {
    try {
      const currentStats = await fetchRoundRaceStats(
        seasonYear,
        event.round,
        event.circuitId,
      );
      if (currentStats) return currentStats;
    } catch (error) {
      debugStats("round fetch failed, falling back to circuit history", {
        seasonYear,
        round: event.round,
        circuitId: event.circuitId,
        error,
      });
    }
  }

  const startYear = isPast ? seasonYear : seasonYear - 1;
  const minYear = getStatsLookbackMinYear(startYear);
  let hadNetworkError = false;

  for (let year = startYear; year >= minYear; year -= 1) {
    try {
      const stats = await fetchCircuitRaceStats(year, event.circuitId);
      if (stats) return stats;
    } catch (error) {
      hadNetworkError = true;
      debugStats("circuit fetch failed, trying previous year", {
        year,
        circuitId: event.circuitId,
        error,
      });
    }
  }

  if (hadNetworkError) {
    debugStats("no stats found after network errors", {
      circuitId: event.circuitId,
      seasonYear,
    });
  }

  return null;
}

/**
 * @param {Array<() => Promise<void>>} tasks
 * @param {number} concurrency
 * @returns {Promise<void>}
 */
async function runWithConcurrency(tasks, concurrency) {
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const taskIndex = index;
      index += 1;
      await tasks[taskIndex]();
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker(),
  );

  await Promise.all(workers);
}

/**
 * @param {import('./api.js').RaceEvent[]} events
 * @param {number} seasonYear
 * @param {Map<string, boolean>} pastByRound
 * @returns {Promise<Map<string, import('./raceStats.js').RaceStats | null>>}
 */
export async function loadSeasonStats(events, seasonYear, pastByRound) {
  resetStatsState();

  /** @type {Map<string, import('./raceStats.js').RaceStats | null>} */
  const statsMap = new Map();

  const tasks = events.map((event) => async () => {
    const isPast = pastByRound.get(event.round) ?? false;
    const stats = await fetchStatsForEvent(event, seasonYear, isPast);
    statsMap.set(event.round, stats);
  });

  await runWithConcurrency(tasks, STATS_CONCURRENCY);

  return statsMap;
}
