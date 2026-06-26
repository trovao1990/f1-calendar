import { SESSION_DURATIONS } from "./constants.js";

/**
 * @typedef {"past" | "active" | "next" | "upcoming"} EventStatus
 */

/**
 * @typedef {import('./api.js').RaceEvent} RaceEvent
 */

/**
 * @param {RaceEvent} event
 * @returns {Date | null}
 */
export function getRaceEndTime(event) {
  const race = event.sessions.find((session) => session.name === "Race");
  if (!race) return null;

  const durationMs = (SESSION_DURATIONS.Race ?? 120) * 60 * 1000;
  return new Date(race.startUtc.getTime() + durationMs);
}

/**
 * @param {RaceEvent} event
 * @returns {Date | null}
 */
export function getLastSessionEndTime(event) {
  const lastSession = event.sessions[event.sessions.length - 1];
  if (!lastSession) return null;

  const durationMs = (SESSION_DURATIONS[lastSession.name] ?? 60) * 60 * 1000;
  return new Date(lastSession.startUtc.getTime() + durationMs);
}

/**
 * @param {RaceEvent} event
 * @param {Date} now
 * @returns {EventStatus}
 */
export function getBaseEventStatus(event, now) {
  if (event.sessions.length === 0) return "upcoming";

  const eventEnd = getRaceEndTime(event) ?? getLastSessionEndTime(event);
  if (eventEnd && eventEnd <= now) return "past";

  const firstSession = event.sessions[0];
  if (firstSession.startUtc <= now) return "active";

  return "upcoming";
}

/**
 * @param {RaceEvent[]} events
 * @param {Date} [now]
 * @returns {Array<{ event: RaceEvent; status: EventStatus }>}
 */
export function classifyEvents(events, now = new Date()) {
  let markedNext = false;

  return events.map((event) => {
    const status = getBaseEventStatus(event, now);

    if (!markedNext && status !== "past") {
      markedNext = true;
      return { event, status: status === "upcoming" ? "next" : status };
    }

    return { event, status };
  });
}
