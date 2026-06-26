import { SESSION_DURATIONS } from "./constants.js";
import { getSessionLabel, t } from "./i18n.js";

/**
 * @param {Date} date
 * @returns {string}
 */
function toIcsUtc(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeIcsText(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function foldLine(text, maxLength = 75) {
  if (text.length <= maxLength) return text;

  const lines = [];
  let remaining = text;

  lines.push(remaining.slice(0, maxLength));
  remaining = remaining.slice(maxLength);

  while (remaining.length > 0) {
    lines.push(` ${remaining.slice(0, maxLength - 1)}`);
    remaining = remaining.slice(maxLength - 1);
  }

  return lines.join("\r\n");
}

/**
 * @param {import('./api.js').Session} session
 * @param {import('./api.js').RaceEvent} event
 * @param {number} year
 * @param {number} index
 * @returns {string}
 */
function buildVEvent(session, event, year, index) {
  const durationMinutes = SESSION_DURATIONS[session.name] ?? 60;
  const endUtc = new Date(session.startUtc.getTime() + durationMinutes * 60 * 1000);
  const label = getSessionLabel(session.name);
  const location = [event.circuitName, event.locality, event.country].filter(Boolean).join(", ");
  const uid = `f1-${year}-r${event.round}-${session.key}-${index}@f1-calendar.local`;
  const summary = `${label} — ${event.raceName}`;

  const lines = [
    "BEGIN:VEVENT",
    foldLine(`UID:${uid}`),
    foldLine(`DTSTAMP:${toIcsUtc(new Date())}`),
    foldLine(`DTSTART:${toIcsUtc(session.startUtc)}`),
    foldLine(`DTEND:${toIcsUtc(endUtc)}`),
    foldLine(`SUMMARY:${escapeIcsText(summary)}`),
    foldLine(`LOCATION:${escapeIcsText(location)}`),
    foldLine(
      `DESCRIPTION:${escapeIcsText(t("icsDescription", { raceName: event.raceName, year, session: label }))}`,
    ),
    "END:VEVENT",
  ];

  return lines.join("\r\n");
}

/**
 * @param {import('./api.js').RaceEvent[]} events
 * @param {number} year
 * @param {string} [calendarName]
 * @returns {string}
 */
export function generateSeasonIcs(events, year, calendarName) {
  const name = calendarName ?? t("icsCalendarName", { year });
  let index = 0;

  const vevents = events
    .flatMap((event) =>
      event.sessions.map((session) => {
        index += 1;
        return buildVEvent(session, event, year, index);
      }),
    )
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//F1 Calendario//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:${escapeIcsText(name)}`),
    vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * @param {import('./api.js').RaceEvent} event
 * @param {number} year
 * @returns {string}
 */
export function generateEventIcs(event, year) {
  return generateSeasonIcs([event], year, `${event.raceName} ${year}`);
}

/**
 * @param {string} content
 * @param {string} filename
 */
export function downloadIcs(content, filename) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
