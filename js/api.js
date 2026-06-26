import { API_BASE, MAX_YEAR, MIN_YEAR } from "./constants.js";

/**
 * @typedef {Object} FetchErrorParams
 * @property {number} [year]
 * @property {number} [status]
 */

export class FetchError extends Error {
  /**
   * @param {string} code
   * @param {FetchErrorParams} [params]
   */
  constructor(code, params = {}) {
    super(code);
    this.name = "FetchError";
    this.code = code;
    this.params = params;
  }
}

/**
 * @typedef {Object} Session
 * @property {string} key
 * @property {string} name
 * @property {Date} startUtc
 */

/**
 * @typedef {Object} RaceEvent
 * @property {string} round
 * @property {string} raceName
 * @property {string} circuitName
 * @property {string} locality
 * @property {string} country
 * @property {string} circuitId
 * @property {Session[]} sessions
 */

/**
 * @param {string} date
 * @param {string} [time]
 * @returns {Date | null}
 */
export function parseUtcDateTime(date, time) {
  const normalizedTime = time ? time.replace("Z", "") : "00:00:00";
  const parsed = new Date(`${date}T${normalizedTime}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * @param {string} key
 * @param {string} name
 * @param {string} date
 * @param {string} [time]
 * @returns {Session | null}
 */
function buildSession(key, name, date, time) {
  const startUtc = parseUtcDateTime(date, time);
  if (!startUtc) return null;
  return { key, name, startUtc };
}

/**
 * @param {Record<string, unknown>} race
 * @returns {Session[]}
 */
function extractSessions(race) {
  /** @type {Array<[string, string]>} */
  const sessionKeys = [
    ["FirstPractice", "FirstPractice"],
    ["SecondPractice", "SecondPractice"],
    ["ThirdPractice", "ThirdPractice"],
    ["SprintQualifying", "SprintQualifying"],
    ["Sprint", "Sprint"],
    ["Qualifying", "Qualifying"],
    ["Race", "Race"],
  ];

  /** @type {Session[]} */
  const sessions = [];

  for (const [key, field] of sessionKeys) {
    const session = race[field];
    if (!session || typeof session !== "object") {
      if (key === "Race" && race.date) {
        const raceSession = buildSession("Race", "Race", race.date, race.time);
        if (raceSession) sessions.push(raceSession);
      }
      continue;
    }

    const { date, time } = /** @type {{ date: string; time?: string }} */ (session);
    if (!date) continue;

    const parsed = buildSession(key, key, date, time);
    if (parsed) sessions.push(parsed);
  }

  return sessions.sort((a, b) => a.startUtc.getTime() - b.startUtc.getTime());
}

/**
 * @param {number} year
 * @returns {Promise<RaceEvent[]>}
 */
export async function fetchSeasonSchedule(year) {
  const response = await fetch(`${API_BASE}/${year}.json`);

  if (!response.ok) {
    throw new FetchError("seasonLoadFailed", { year, status: response.status });
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new FetchError("invalidResponse", { year });
  }

  const races = data?.MRData?.RaceTable?.Races;

  if (!Array.isArray(races) || races.length === 0) {
    throw new FetchError("noEventsFound", { year });
  }

  const events = races
    .map((race) => ({
      round: String(race.round),
      raceName: race.raceName ?? "",
      circuitName: race.Circuit?.circuitName ?? "",
      circuitId: race.Circuit?.circuitId ?? "",
      locality: race.Circuit?.Location?.locality ?? "",
      country: race.Circuit?.Location?.country ?? "",
      sessions: extractSessions(race),
    }))
    .filter((race) => race.sessions.length > 0);

  if (events.length === 0) {
    throw new FetchError("noEventsFound", { year });
  }

  return events;
}

/**
 * @returns {number[]}
 */
export function getAvailableYears() {
  const years = [];
  for (let year = MAX_YEAR; year >= MIN_YEAR; year -= 1) {
    years.push(year);
  }
  return years;
}
