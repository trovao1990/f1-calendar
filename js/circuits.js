const SVG_BASE =
  "https://cdn.jsdelivr.net/gh/julesr0y/f1-circuits-svg@main/circuits/minimal/white-outline";

/** @type {Record<string, string>} Ergast circuitId → layout SVG id */
export const CIRCUIT_LAYOUTS = {
  albert_park: "melbourne-2",
  shanghai: "shanghai-1",
  suzuka: "suzuka-2",
  bahrain: "bahrain-1",
  jeddah: "jeddah-1",
  miami: "miami-1",
  imola: "imola-1",
  monaco: "monaco-6",
  catalunya: "catalunya-6",
  madring: "madring-1",
  villeneuve: "montreal-6",
  red_bull_ring: "spielberg-3",
  silverstone: "silverstone-8",
  spa: "spa-francorchamps-4",
  hungaroring: "hungaroring-3",
  zandvoort: "zandvoort-5",
  monza: "monza-7",
  baku: "baku-1",
  marina_bay: "marina-bay-4",
  americas: "austin-1",
  rodriguez: "mexico-city-3",
  interlagos: "interlagos-2",
  vegas: "las-vegas-1",
  losail: "lusail-1",
  yas_marina: "yas-marina-2",
};

/** Fallback lap counts for the current F1 calendar layouts. */
export const CIRCUIT_LAPS = {
  albert_park: 58,
  shanghai: 56,
  suzuka: 53,
  bahrain: 57,
  jeddah: 50,
  miami: 57,
  imola: 63,
  monaco: 78,
  catalunya: 66,
  madring: 57,
  villeneuve: 70,
  red_bull_ring: 71,
  silverstone: 52,
  spa: 44,
  hungaroring: 70,
  zandvoort: 72,
  monza: 53,
  baku: 51,
  marina_bay: 62,
  americas: 56,
  rodriguez: 71,
  interlagos: 71,
  vegas: 50,
  losail: 57,
  yas_marina: 58,
};

/**
 * @param {string} circuitId
 * @returns {string | null}
 */
export function getCircuitImageUrl(circuitId) {
  const layoutId = CIRCUIT_LAYOUTS[circuitId];
  if (!layoutId) return null;
  return `${SVG_BASE}/${layoutId}.svg`;
}

/**
 * @param {string} circuitId
 * @returns {number | null}
 */
export function getCircuitLapCount(circuitId) {
  return CIRCUIT_LAPS[circuitId] ?? null;
}

/**
 * @param {string} circuitId
 * @returns {string}
 */
export function getCircuitImageAlt(circuitId) {
  return circuitId.replaceAll("_", " ");
}
