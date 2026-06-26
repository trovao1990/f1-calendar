import { fetchSeasonSchedule, getAvailableYears, FetchError } from "./api.js";
import {
  getCircuitImageUrl,
  getCircuitLapCount,
} from "./circuits.js";
import { DEFAULT_TIMEZONE } from "./constants.js";
import { escapeAttr, escapeHtml } from "./dom.js";
import { classifyEvents } from "./events.js";
import { downloadIcs, generateEventIcs, generateSeasonIcs } from "./ics.js";
import {
  applyLanguage,
  getHtmlLang,
  getLanguage,
  getSessionLabel,
  getTimezoneLabel,
  LANGUAGES,
  resolveInitialLanguage,
  setLanguage,
  t,
  TIMEZONE_IDS,
  translateFetchError,
} from "./i18n.js";
import {
  formatDateOnly,
  formatDateTime,
  getStoredTimezone,
  isValidTimezone,
  resolveTimezone,
  storeTimezone,
} from "./timezone.js";
import { loadSeasonStats } from "./raceStats.js";

const yearSelect = /** @type {HTMLSelectElement} */ (document.getElementById("year-select"));
const timezoneSelect = /** @type {HTMLSelectElement} */ (
  document.getElementById("timezone-select")
);
const languageSelect = /** @type {HTMLSelectElement} */ (
  document.getElementById("language-select")
);
const downloadSeasonBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById("download-season-btn")
);
const statusEl = /** @type {HTMLElement} */ (document.getElementById("status"));
const eventsContainer = /** @type {HTMLElement} */ (
  document.getElementById("events-container")
);
const controlsEl = /** @type {HTMLElement} */ (document.getElementById("controls"));

/** @type {import('./api.js').RaceEvent[]} */
let currentEvents = [];
/** @type {number} */
let currentYear = new Date().getFullYear();
/** @type {number} */
let loadToken = 0;
/** @type {boolean} */
let shouldScrollToNext = false;
/** @type {FetchError | null} */
let lastFetchError = null;
/** @type {boolean} */
let lastLoadWasGenericError = false;
/** @type {Map<string, import('./raceStats.js').RaceStats | null>} */
let currentEventStats = new Map();

/** @typedef {import('./events.js').EventStatus} EventStatus */

function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.className = `status${type === "error" ? " status--error" : ""}${type === "loading" ? " status--loading" : ""}`;
}

function applyStaticUi() {
  document.documentElement.lang = getHtmlLang();
  document.title = t("pageTitle");

  const metaDescription = document.getElementById("meta-description");
  if (metaDescription) {
    metaDescription.setAttribute("content", t("metaDescription"));
  }

  const headerTitle = document.getElementById("header-title");
  const headerSubtitle = document.getElementById("header-subtitle");
  const labelYear = document.getElementById("label-year");
  const labelTimezone = document.getElementById("label-timezone");
  const labelLanguage = document.getElementById("label-language");
  const footerData = document.getElementById("footer-data");
  const footerNote = document.getElementById("footer-note");

  if (headerTitle) headerTitle.textContent = t("appTitle");
  if (headerSubtitle) headerSubtitle.textContent = t("appSubtitle");
  if (labelYear) labelYear.textContent = t("season");
  if (labelTimezone) labelTimezone.textContent = t("timezone");
  if (labelLanguage) labelLanguage.textContent = t("language");
  if (footerData) footerData.textContent = `${t("footerData")} `;
  if (footerNote) footerNote.textContent = t("footerNote");

  controlsEl.setAttribute("aria-label", t("controlsAria"));
  yearSelect.setAttribute("aria-label", t("selectYear"));
  timezoneSelect.setAttribute("aria-label", t("selectTimezone"));
  languageSelect.setAttribute("aria-label", t("selectLanguage"));
  downloadSeasonBtn.textContent = t("downloadSeason");
}

function populateLanguageSelect() {
  const current = getLanguage();
  languageSelect.innerHTML = LANGUAGES.map(
    (lang) =>
      `<option value="${escapeAttr(lang.id)}"${lang.id === current ? " selected" : ""}>${escapeHtml(lang.label)}</option>`,
  ).join("");
}

function populateYearSelect() {
  const years = getAvailableYears();
  yearSelect.innerHTML = years
    .map(
      (year) =>
        `<option value="${year}"${year === currentYear ? " selected" : ""}>${year}</option>`,
    )
    .join("");
}

function populateTimezoneSelect() {
  const saved = getStoredTimezone(DEFAULT_TIMEZONE);
  const selectedValue = timezoneSelect.value || saved;

  timezoneSelect.innerHTML = TIMEZONE_IDS.map(
    (id) =>
      `<option value="${escapeAttr(id)}"${id === selectedValue ? " selected" : ""}>${escapeHtml(getTimezoneLabel(id))}</option>`,
  ).join("");

  if (!TIMEZONE_IDS.includes(selectedValue)) {
    const option = document.createElement("option");
    option.value = selectedValue;
    option.textContent = selectedValue;
    option.selected = true;
    timezoneSelect.prepend(option);
  }
}

function getActiveTimezone() {
  return resolveTimezone(timezoneSelect.value);
}

/**
 * @param {import('./api.js').RaceEvent} event
 * @param {boolean} [compact]
 */
function renderCircuitPanel(event, compact = false) {
  const imageUrl = getCircuitImageUrl(event.circuitId);
  const stats = currentEventStats.get(event.round);
  const laps = stats?.laps ?? getCircuitLapCount(event.circuitId);
  const avgLap = stats?.avgLapTime ?? t("statUnavailable");
  const winner = stats
    ? `${stats.winnerName} (${stats.winnerYear})`
    : t("statUnavailable");

  return `
    <div class="circuit-panel${compact ? " circuit-panel--compact" : ""}">
      <div class="circuit-panel__map" aria-hidden="true">
        ${
          imageUrl
            ? `<img src="${escapeAttr(imageUrl)}" alt="" class="circuit-panel__img" loading="lazy" />`
            : `<div class="circuit-panel__placeholder"></div>`
        }
      </div>
      <dl class="circuit-panel__stats">
        <div class="circuit-panel__stat">
          <dt>${escapeHtml(t("statLaps"))}</dt>
          <dd>${escapeHtml(laps ?? t("statUnavailable"))}</dd>
        </div>
        <div class="circuit-panel__stat">
          <dt>${escapeHtml(t("statAvgLap"))}</dt>
          <dd class="circuit-panel__mono">${escapeHtml(avgLap)}</dd>
        </div>
        <div class="circuit-panel__stat circuit-panel__stat--wide">
          <dt>${escapeHtml(t("statLastWinner"))}</dt>
          <dd>${escapeHtml(winner)}</dd>
        </div>
      </dl>
    </div>
  `;
}

/**
 * @param {import('./api.js').Session} session
 * @param {string} round
 * @param {string} timezone
 */
function renderSessionRow(session, round, timezone) {
  const label = getSessionLabel(session.name);
  const isRace = session.name === "Race";

  return `
    <div class="session-row">
      <span class="session-row__name${isRace ? " session-row__name--race" : ""}">${escapeHtml(label)}</span>
      <span class="session-row__datetime">${escapeHtml(formatDateTime(session.startUtc, timezone))}</span>
      <div class="session-row__actions">
        <button
          type="button"
          class="btn btn--secondary btn--small session-download-btn"
          data-round="${escapeAttr(round)}"
          data-session-key="${escapeAttr(session.key)}"
          aria-label="${escapeAttr(t("downloadSession", { session: label }))}"
        >
          .ics
        </button>
      </div>
    </div>
  `;
}

/**
 * @param {import('./api.js').RaceEvent} event
 * @param {string} timezone
 * @param {boolean} [compactActions]
 */
function renderEventBody(event, timezone, compactActions = false) {
  const sessionsHtml = event.sessions
    .map((session) => renderSessionRow(session, event.round, timezone))
    .join("");

  return `
    <div class="event-card__body">
      ${renderCircuitPanel(event, compactActions)}
      ${
        compactActions
          ? `
        <div class="event-card__body-actions">
          <button
            type="button"
            class="btn btn--secondary btn--small event-download-btn"
            data-round="${escapeAttr(event.round)}"
          >
            ${escapeHtml(t("downloadGp"))}
          </button>
        </div>`
          : ""
      }
      <div class="sessions">${sessionsHtml}</div>
    </div>
  `;
}

/**
 * @param {import('./api.js').RaceEvent} event
 * @param {string} timezone
 */
function renderPastEventItem(event, timezone) {
  const raceSession = event.sessions.find((session) => session.name === "Race");
  const raceDateLabel = raceSession
    ? formatDateOnly(raceSession.startUtc, timezone)
    : "";
  const thumbUrl = getCircuitImageUrl(event.circuitId);

  return `
    <details class="event-card event-card--past" data-round="${escapeAttr(event.round)}">
      <summary class="event-card__summary-compact">
        ${
          thumbUrl
            ? `<span class="event-card__circuit-thumb"><img src="${escapeAttr(thumbUrl)}" alt="" loading="lazy" /></span>`
            : ""
        }
        <span class="event-card__round event-card__round--muted">R${escapeHtml(event.round)}</span>
        <span class="event-card__compact-info">
          <span class="event-card__name-compact">${escapeHtml(event.raceName)}</span>
          <span class="event-card__location-compact">${escapeHtml(event.locality)}, ${escapeHtml(event.country)}</span>
        </span>
        ${raceDateLabel ? `<span class="event-card__date-compact">${escapeHtml(raceDateLabel)}</span>` : ""}
        <span class="event-card__done" title="${escapeAttr(t("raceCompleted"))}" aria-label="${escapeAttr(t("raceCompleted"))}"></span>
        <span class="visually-hidden">${escapeHtml(t("showDetails"))}</span>
      </summary>
      ${renderEventBody(event, timezone, true)}
    </details>
  `;
}

/**
 * @param {import('./api.js').RaceEvent[]} pastEvents
 * @param {string} timezone
 */
function renderPastEventsGroup(pastEvents, timezone) {
  return `
    <details class="past-events">
      <summary class="past-events__summary">
        <span class="past-events__title">${escapeHtml(t("pastRacesTitle", { count: pastEvents.length }))}</span>
        <span class="past-events__hint">${escapeHtml(t("pastRacesHint"))}</span>
      </summary>
      <div class="past-events__list">
        ${pastEvents.map((event) => renderPastEventItem(event, timezone)).join("")}
      </div>
    </details>
  `;
}

/**
 * @param {import('./api.js').RaceEvent} event
 * @param {string} timezone
 * @param {EventStatus} status
 */
function renderEventCard(event, timezone, status) {
  const raceSession = event.sessions.find((session) => session.name === "Race");
  const raceDateLabel = raceSession
    ? formatDateOnly(raceSession.startUtc, timezone)
    : "";

  const statusClass =
    status === "next"
      ? " event-card--next"
      : status === "active"
        ? " event-card--active"
        : "";

  const badge =
    status === "next"
      ? `<span class="event-card__badge event-card__badge--next">${escapeHtml(t("nextRace"))}</span>`
      : status === "active"
        ? `<span class="event-card__badge event-card__badge--active">${escapeHtml(t("raceWeekend"))}</span>`
        : "";

  return `
    <article class="event-card${statusClass}" data-round="${escapeAttr(event.round)}">
      <header class="event-card__header">
        <span class="event-card__round">R${escapeHtml(event.round)}</span>
        <div class="event-card__info">
          ${badge}
          <h2 class="event-card__name">${escapeHtml(event.raceName)}</h2>
          <p class="event-card__location">${escapeHtml(event.circuitName)} — ${escapeHtml(event.locality)}, ${escapeHtml(event.country)}</p>
        </div>
        <div class="event-card__actions">
          ${raceDateLabel ? `<span class="event-card__race-date">${escapeHtml(raceDateLabel)}</span>` : ""}
          <button
            type="button"
            class="btn btn--secondary btn--small event-download-btn"
            data-round="${escapeAttr(event.round)}"
          >
            ${escapeHtml(t("downloadGp"))}
          </button>
        </div>
      </header>
      ${renderEventBody(event, timezone)}
    </article>
  `;
}

/**
 * @param {import('./api.js').RaceEvent} raceEvent
 */
function downloadGrandPrixIcs(raceEvent) {
  const slug = raceEvent.raceName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const ics = generateEventIcs(raceEvent, currentYear);
  downloadIcs(ics, `f1-${currentYear}-${slug || `r${raceEvent.round}`}.ics`);
}

function setupEventDelegation() {
  eventsContainer.addEventListener("click", (clickEvent) => {
    const target = clickEvent.target;
    if (!(target instanceof Element)) return;

    const gpButton = target.closest(".event-download-btn");
    if (gpButton instanceof HTMLButtonElement) {
      clickEvent.stopPropagation();
      const round = gpButton.getAttribute("data-round");
      const raceEvent = currentEvents.find((item) => item.round === round);
      if (!raceEvent) return;
      downloadGrandPrixIcs(raceEvent);
      return;
    }

    const sessionButton = target.closest(".session-download-btn");
    if (sessionButton instanceof HTMLButtonElement) {
      clickEvent.stopPropagation();
      const round =
        sessionButton.getAttribute("data-round") ??
        sessionButton.closest("[data-round]")?.getAttribute("data-round");
      const sessionKey = sessionButton.getAttribute("data-session-key");
      const raceEvent = currentEvents.find((item) => item.round === round);
      const session = raceEvent?.sessions.find((item) => item.key === sessionKey);
      if (!raceEvent || !session) return;

      const label = getSessionLabel(session.name).toLowerCase().replace(/\s+/g, "-");
      const ics = generateEventIcs({ ...raceEvent, sessions: [session] }, currentYear);
      downloadIcs(ics, `f1-${currentYear}-r${raceEvent.round}-${label}.ics`);
    }
  });
}

function scrollToUpcomingRace() {
  if (!shouldScrollToNext) return;

  const target = eventsContainer.querySelector(".event-card--next, .event-card--active");
  shouldScrollToNext = false;

  if (!target) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(() => {
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  });
}

function renderEvents() {
  const timezone = getActiveTimezone();

  if (currentEvents.length === 0) {
    eventsContainer.innerHTML = `<div class="empty-state">${escapeHtml(t("noEvents"))}</div>`;
    return;
  }

  const classified = classifyEvents(currentEvents);
  const pastItems = classified.filter((item) => item.status === "past");
  const upcomingItems = classified.filter((item) => item.status !== "past");

  const html = [
    pastItems.length > 0
      ? renderPastEventsGroup(
          pastItems.map((item) => item.event),
          timezone,
        )
      : "",
    ...upcomingItems.map((item) => renderEventCard(item.event, timezone, item.status)),
  ].join("");

  eventsContainer.innerHTML = html;
  scrollToUpcomingRace();
}

function showLoadError(message) {
  eventsContainer.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
  setStatus(message, "error");
}

function clearLoadErrorState() {
  lastFetchError = null;
  lastLoadWasGenericError = false;
}

function refreshErrorMessage() {
  if (!statusEl.classList.contains("status--error")) return;

  if (lastFetchError) {
    showLoadError(translateFetchError(lastFetchError));
  } else if (lastLoadWasGenericError) {
    showLoadError(t("genericLoadError"));
  }
}

async function loadSeason(year) {
  const token = ++loadToken;
  currentYear = year;
  clearLoadErrorState();
  setStatus(t("loading"), "loading");
  downloadSeasonBtn.disabled = true;

  try {
    const events = await fetchSeasonSchedule(year);
    if (token !== loadToken) return;

    currentEvents = events;
    const classified = classifyEvents(events);
    const pastByRound = new Map(
      classified.map((item) => [item.event.round, item.status === "past"]),
    );
    currentEventStats = await loadSeasonStats(events, year, pastByRound);
    if (token !== loadToken) return;

    shouldScrollToNext = true;
    renderEvents();
    setStatus(t("seasonLoaded", { count: currentEvents.length, year }));
    downloadSeasonBtn.disabled = false;
  } catch (error) {
    if (token !== loadToken) return;

    currentEvents = [];
    currentEventStats = new Map();
    if (error instanceof FetchError) {
      lastFetchError = error;
      showLoadError(translateFetchError(error));
    } else {
      lastLoadWasGenericError = true;
      showLoadError(t("genericLoadError"));
    }
    downloadSeasonBtn.disabled = true;
  }
}

function refreshUiAfterLanguageChange() {
  applyStaticUi();
  populateLanguageSelect();
  populateTimezoneSelect();

  if (currentEvents.length > 0) {
    renderEvents();
    setStatus(t("seasonLoaded", { count: currentEvents.length, year: currentYear }));
  } else if (statusEl.classList.contains("status--error")) {
    refreshErrorMessage();
  } else if (!statusEl.classList.contains("status--loading")) {
    setStatus("");
  }
}

yearSelect.addEventListener("change", () => {
  loadSeason(Number(yearSelect.value));
});

timezoneSelect.addEventListener("change", () => {
  const selected = timezoneSelect.value;
  const resolved = resolveTimezone(selected);

  if (!isValidTimezone(selected)) {
    timezoneSelect.value = resolved;
    setStatus(t("invalidTimezone", { timezone: getTimezoneLabel(DEFAULT_TIMEZONE) }), "error");
  }

  storeTimezone(resolved);
  renderEvents();
});

languageSelect.addEventListener("change", () => {
  setLanguage(languageSelect.value);
  refreshUiAfterLanguageChange();
});

downloadSeasonBtn.addEventListener("click", () => {
  if (currentEvents.length === 0) return;
  const ics = generateSeasonIcs(currentEvents, currentYear);
  downloadIcs(ics, t("seasonIcsFilename", { year: currentYear }));
});

setupEventDelegation();
applyLanguage(resolveInitialLanguage());
populateLanguageSelect();
applyStaticUi();
populateYearSelect();
populateTimezoneSelect();
loadSeason(Number(yearSelect.value));
