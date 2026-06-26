import { DEFAULT_TIMEZONE } from "./constants.js";
import { getLocale } from "./i18n.js";

const STORAGE_KEY = "f1-calendar-timezone";

/**
 * @param {string} timezone
 * @returns {boolean}
 */
export function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} timezone
 * @param {string} [fallback]
 * @returns {string}
 */
export function resolveTimezone(timezone, fallback = DEFAULT_TIMEZONE) {
  return isValidTimezone(timezone) ? timezone : fallback;
}

/**
 * @param {string} fallback
 * @returns {string}
 */
export function getStoredTimezone(fallback) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? resolveTimezone(stored, fallback) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * @param {string} timezone
 */
export function storeTimezone(timezone) {
  try {
    localStorage.setItem(STORAGE_KEY, resolveTimezone(timezone));
  } catch {
    /* ignore */
  }
}

/**
 * @param {Date} dateUtc
 * @param {string} timezone
 * @returns {string}
 */
export function formatDateTime(dateUtc, timezone) {
  const tz = resolveTimezone(timezone);
  return new Intl.DateTimeFormat(getLocale(), {
    timeZone: tz,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dateUtc);
}

/**
 * @param {Date} dateUtc
 * @param {string} timezone
 * @returns {string}
 */
export function formatDateOnly(dateUtc, timezone) {
  const tz = resolveTimezone(timezone);
  return new Intl.DateTimeFormat(getLocale(), {
    timeZone: tz,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(dateUtc);
}
