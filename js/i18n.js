export const DEFAULT_LANGUAGE = "en";

export const LANGUAGES = [
  { id: "pt", label: "Português", locale: "pt-BR", htmlLang: "pt-BR" },
  { id: "en", label: "English", locale: "en-US", htmlLang: "en" },
  { id: "fr", label: "Français", locale: "fr-FR", htmlLang: "fr" },
  { id: "es", label: "Español", locale: "es-ES", htmlLang: "es" },
];

/** @type {Record<string, Record<string, string>>} */
const MESSAGES = {
  pt: {
    pageTitle: "F1 Calendário — Horários por ano",
    metaDescription:
      "Consulte o calendário da Fórmula 1 por ano e baixe eventos para o calendário do seu celular.",
    appTitle: "Calendário F1",
    appSubtitle: "Datas, horários e possibilidade de download do calendário",
    controlsAria: "Filtros",
    season: "Temporada",
    selectYear: "Selecionar ano",
    timezone: "Fuso horário",
    selectTimezone: "Selecionar fuso horário",
    language: "Idioma",
    selectLanguage: "Selecionar idioma",
    downloadSeason: "Baixar temporada (.ics)",
    downloadGp: "Baixar GP (.ics)",
    downloadSession: "Baixar {session} para calendário",
    footerData: "Dados via",
    footerNote: "Horários convertidos para o fuso selecionado.",
    loading: "Carregando calendário…",
    seasonLoaded: "{count} Grandes Prêmios — temporada {year}",
    noEvents: "Nenhum evento para exibir.",
    invalidTimezone: "Fuso horário inválido. Usando {timezone}.",
    seasonLoadFailed: "Não foi possível carregar a temporada {year} ({status}).",
    noEventsFound: "Nenhum evento encontrado para {year}.",
    genericLoadError: "Erro ao carregar dados.",
    invalidResponse: "Resposta inválida ao carregar a temporada {year}.",
    seasonIcsFilename: "f1-calendario-{year}.ics",
    icsDescription: "Fórmula 1 — {raceName} ({year}). Sessão: {session}.",
    icsCalendarName: "F1 {year}",
    pastRacesTitle: "{count} corridas realizadas",
    pastRacesHint: "Clique para expandir ou recolher",
    nextRace: "Próxima corrida",
    raceWeekend: "Fim de semana de corrida",
    raceCompleted: "Realizada",
    showDetails: "Ver detalhes",
    statLaps: "Voltas",
    statAvgLap: "Tempo médio/volta",
    statLastWinner: "Último vencedor",
    statUnavailable: "—",
  },
  en: {
    pageTitle: "F1 Calendar — Schedules by year",
    metaDescription:
      "Browse the Formula 1 calendar by year and download events to your phone calendar.",
    appTitle: "F1 Calendar",
    appSubtitle: "Dates, times and calendar downloads",
    controlsAria: "Filters",
    season: "Season",
    selectYear: "Select year",
    timezone: "Time zone",
    selectTimezone: "Select time zone",
    language: "Language",
    selectLanguage: "Select language",
    downloadSeason: "Download season (.ics)",
    downloadGp: "Download GP (.ics)",
    downloadSession: "Download {session} to calendar",
    footerData: "Data via",
    footerNote: "Times converted to the selected time zone.",
    loading: "Loading calendar…",
    seasonLoaded: "{count} Grands Prix — {year} season",
    noEvents: "No events to display.",
    invalidTimezone: "Invalid time zone. Using {timezone}.",
    seasonLoadFailed: "Could not load the {year} season ({status}).",
    noEventsFound: "No events found for {year}.",
    genericLoadError: "Failed to load data.",
    invalidResponse: "Invalid response while loading the {year} season.",
    seasonIcsFilename: "f1-calendar-{year}.ics",
    icsDescription: "Formula 1 — {raceName} ({year}). Session: {session}.",
    icsCalendarName: "F1 {year}",
    pastRacesTitle: "{count} completed races",
    pastRacesHint: "Click to expand or collapse",
    nextRace: "Next race",
    raceWeekend: "Race weekend",
    raceCompleted: "Completed",
    showDetails: "View details",
    statLaps: "Laps",
    statAvgLap: "Avg. lap time",
    statLastWinner: "Last winner",
    statUnavailable: "—",
  },
  fr: {
    pageTitle: "Calendrier F1 — Horaires par année",
    metaDescription:
      "Consultez le calendrier de Formule 1 par année et téléchargez les événements sur votre calendrier mobile.",
    appTitle: "Calendrier F1",
    appSubtitle: "Dates, horaires et téléchargement calendrier",
    controlsAria: "Filtres",
    season: "Saison",
    selectYear: "Sélectionner l'année",
    timezone: "Fuseau horaire",
    selectTimezone: "Sélectionner le fuseau horaire",
    language: "Langue",
    selectLanguage: "Sélectionner la langue",
    downloadSeason: "Télécharger la saison (.ics)",
    downloadGp: "Télécharger le GP (.ics)",
    downloadSession: "Télécharger {session} vers le calendrier",
    footerData: "Données via",
    footerNote: "Horaires convertis selon le fuseau sélectionné.",
    loading: "Chargement du calendrier…",
    seasonLoaded: "{count} Grands Prix — saison {year}",
    noEvents: "Aucun événement à afficher.",
    invalidTimezone: "Fuseau horaire invalide. Utilisation de {timezone}.",
    seasonLoadFailed: "Impossible de charger la saison {year} ({status}).",
    noEventsFound: "Aucun événement trouvé pour {year}.",
    genericLoadError: "Erreur lors du chargement des données.",
    invalidResponse: "Réponse invalide lors du chargement de la saison {year}.",
    seasonIcsFilename: "f1-calendrier-{year}.ics",
    icsDescription: "Formule 1 — {raceName} ({year}). Session : {session}.",
    icsCalendarName: "F1 {year}",
    pastRacesTitle: "{count} courses terminées",
    pastRacesHint: "Cliquez pour développer ou réduire",
    nextRace: "Prochaine course",
    raceWeekend: "Week-end de course",
    raceCompleted: "Terminée",
    showDetails: "Voir les détails",
    statLaps: "Tours",
    statAvgLap: "Temps moyen/tour",
    statLastWinner: "Dernier vainqueur",
    statUnavailable: "—",
  },
  es: {
    pageTitle: "Calendario F1 — Horarios por año",
    metaDescription:
      "Consulta el calendario de Fórmula 1 por año y descarga eventos para el calendario de tu móvil.",
    appTitle: "Calendario F1",
    appSubtitle: "Fechas, horarios y descarga para tu calendario",
    controlsAria: "Filtros",
    season: "Temporada",
    selectYear: "Seleccionar año",
    timezone: "Zona horaria",
    selectTimezone: "Seleccionar zona horaria",
    language: "Idioma",
    selectLanguage: "Seleccionar idioma",
    downloadSeason: "Descargar temporada (.ics)",
    downloadGp: "Descargar GP (.ics)",
    downloadSession: "Descargar {session} al calendario",
    footerData: "Datos vía",
    footerNote: "Horarios convertidos a la zona horaria seleccionada.",
    loading: "Cargando calendario…",
    seasonLoaded: "{count} Grandes Premios — temporada {year}",
    noEvents: "No hay eventos para mostrar.",
    invalidTimezone: "Zona horaria no válida. Usando {timezone}.",
    seasonLoadFailed: "No se pudo cargar la temporada {year} ({status}).",
    noEventsFound: "No se encontraron eventos para {year}.",
    genericLoadError: "Error al cargar los datos.",
    invalidResponse: "Respuesta no válida al cargar la temporada {year}.",
    seasonIcsFilename: "f1-calendario-{year}.ics",
    icsDescription: "Fórmula 1 — {raceName} ({year}). Sesión: {session}.",
    icsCalendarName: "F1 {year}",
    pastRacesTitle: "{count} carreras disputadas",
    pastRacesHint: "Haz clic para expandir o contraer",
    nextRace: "Próxima carrera",
    raceWeekend: "Fin de semana de carrera",
    raceCompleted: "Disputada",
    showDetails: "Ver detalles",
    statLaps: "Vueltas",
    statAvgLap: "Tiempo medio/vuelta",
    statLastWinner: "Último ganador",
    statUnavailable: "—",
  },
};

/** @type {Record<string, Record<string, Record<string, string>>>} */
const SESSION_LABELS = {
  pt: {
    FirstPractice: "Treino 1",
    SecondPractice: "Treino 2",
    ThirdPractice: "Treino 3",
    Qualifying: "Classificação",
    Sprint: "Sprint",
    SprintQualifying: "Classificação Sprint",
    Race: "Corrida",
  },
  en: {
    FirstPractice: "Practice 1",
    SecondPractice: "Practice 2",
    ThirdPractice: "Practice 3",
    Qualifying: "Qualifying",
    Sprint: "Sprint",
    SprintQualifying: "Sprint Qualifying",
    Race: "Race",
  },
  fr: {
    FirstPractice: "Essais 1",
    SecondPractice: "Essais 2",
    ThirdPractice: "Essais 3",
    Qualifying: "Qualifications",
    Sprint: "Sprint",
    SprintQualifying: "Qualifications sprint",
    Race: "Course",
  },
  es: {
    FirstPractice: "Entrenamiento 1",
    SecondPractice: "Entrenamiento 2",
    ThirdPractice: "Entrenamiento 3",
    Qualifying: "Clasificación",
    Sprint: "Sprint",
    SprintQualifying: "Clasificación sprint",
    Race: "Carrera",
  },
};

/** @type {Record<string, Record<string, string>>} */
const TIMEZONE_LABELS = {
  pt: {
    "America/Sao_Paulo": "São Paulo, Brasil (BRT/BRST)",
    "America/Manaus": "Manaus, Brasil (AMT)",
    "America/Fortaleza": "Fortaleza, Brasil (BRT)",
    "America/Rio_Branco": "Rio Branco, Brasil (ACT)",
    UTC: "UTC (Tempo Universal Coordenado)",
    "Europe/London": "Londres, Reino Unido",
    "Europe/Paris": "Paris, França",
    "Europe/Berlin": "Berlim, Alemanha",
    "Europe/Rome": "Roma, Itália",
    "Europe/Madrid": "Madrid, Espanha",
    "America/New_York": "Nova York, EUA",
    "America/Chicago": "Chicago, EUA",
    "America/Denver": "Denver, EUA",
    "America/Los_Angeles": "Los Angeles, EUA",
    "America/Mexico_City": "Cidade do México, México",
    "America/Argentina/Buenos_Aires": "Buenos Aires, Argentina",
    "America/Santiago": "Santiago, Chile",
    "America/Bogota": "Bogotá, Colômbia",
    "Asia/Tokyo": "Tóquio, Japão",
    "Asia/Shanghai": "Xangai, China",
    "Asia/Singapore": "Singapura",
    "Asia/Dubai": "Dubai, Emirados Árabes",
    "Australia/Sydney": "Sydney, Austrália",
    "Pacific/Auckland": "Auckland, Nova Zelândia",
  },
  en: {
    "America/Sao_Paulo": "São Paulo, Brazil (BRT/BRST)",
    "America/Manaus": "Manaus, Brazil (AMT)",
    "America/Fortaleza": "Fortaleza, Brazil (BRT)",
    "America/Rio_Branco": "Rio Branco, Brazil (ACT)",
    UTC: "UTC (Coordinated Universal Time)",
    "Europe/London": "London, United Kingdom",
    "Europe/Paris": "Paris, France",
    "Europe/Berlin": "Berlin, Germany",
    "Europe/Rome": "Rome, Italy",
    "Europe/Madrid": "Madrid, Spain",
    "America/New_York": "New York, USA",
    "America/Chicago": "Chicago, USA",
    "America/Denver": "Denver, USA",
    "America/Los_Angeles": "Los Angeles, USA",
    "America/Mexico_City": "Mexico City, Mexico",
    "America/Argentina/Buenos_Aires": "Buenos Aires, Argentina",
    "America/Santiago": "Santiago, Chile",
    "America/Bogota": "Bogotá, Colombia",
    "Asia/Tokyo": "Tokyo, Japan",
    "Asia/Shanghai": "Shanghai, China",
    "Asia/Singapore": "Singapore",
    "Asia/Dubai": "Dubai, UAE",
    "Australia/Sydney": "Sydney, Australia",
    "Pacific/Auckland": "Auckland, New Zealand",
  },
  fr: {
    "America/Sao_Paulo": "São Paulo, Brésil (BRT/BRST)",
    "America/Manaus": "Manaus, Brésil (AMT)",
    "America/Fortaleza": "Fortaleza, Brésil (BRT)",
    "America/Rio_Branco": "Rio Branco, Brésil (ACT)",
    UTC: "UTC (Temps universel coordonné)",
    "Europe/London": "Londres, Royaume-Uni",
    "Europe/Paris": "Paris, France",
    "Europe/Berlin": "Berlin, Allemagne",
    "Europe/Rome": "Rome, Italie",
    "Europe/Madrid": "Madrid, Espagne",
    "America/New_York": "New York, États-Unis",
    "America/Chicago": "Chicago, États-Unis",
    "America/Denver": "Denver, États-Unis",
    "America/Los_Angeles": "Los Angeles, États-Unis",
    "America/Mexico_City": "Mexico, Mexique",
    "America/Argentina/Buenos_Aires": "Buenos Aires, Argentine",
    "America/Santiago": "Santiago, Chili",
    "America/Bogota": "Bogotá, Colombie",
    "Asia/Tokyo": "Tokyo, Japon",
    "Asia/Shanghai": "Shanghai, Chine",
    "Asia/Singapore": "Singapour",
    "Asia/Dubai": "Dubai, Émirats arabes unis",
    "Australia/Sydney": "Sydney, Australie",
    "Pacific/Auckland": "Auckland, Nouvelle-Zélande",
  },
  es: {
    "America/Sao_Paulo": "São Paulo, Brasil (BRT/BRST)",
    "America/Manaus": "Manaus, Brasil (AMT)",
    "America/Fortaleza": "Fortaleza, Brasil (BRT)",
    "America/Rio_Branco": "Rio Branco, Brasil (ACT)",
    UTC: "UTC (Tiempo Universal Coordinado)",
    "Europe/London": "Londres, Reino Unido",
    "Europe/Paris": "París, Francia",
    "Europe/Berlin": "Berlín, Alemania",
    "Europe/Rome": "Roma, Italia",
    "Europe/Madrid": "Madrid, España",
    "America/New_York": "Nueva York, EE.UU.",
    "America/Chicago": "Chicago, EE.UU.",
    "America/Denver": "Denver, EE.UU.",
    "America/Los_Angeles": "Los Ángeles, EE.UU.",
    "America/Mexico_City": "Ciudad de México, México",
    "America/Argentina/Buenos_Aires": "Buenos Aires, Argentina",
    "America/Santiago": "Santiago, Chile",
    "America/Bogota": "Bogotá, Colombia",
    "Asia/Tokyo": "Tokio, Japón",
    "Asia/Shanghai": "Shanghái, China",
    "Asia/Singapore": "Singapur",
    "Asia/Dubai": "Dubái, Emiratos Árabes",
    "Australia/Sydney": "Sídney, Australia",
    "Pacific/Auckland": "Auckland, Nueva Zelanda",
  },
};

const STORAGE_KEY = "f1-calendar-language";

/** @type {string} */
let currentLanguage = DEFAULT_LANGUAGE;

/**
 * @param {string} lang
 * @returns {boolean}
 */
function isSupportedLanguage(lang) {
  return LANGUAGES.some((entry) => entry.id === lang);
}

/**
 * @returns {string}
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * @returns {string}
 */
export function getLocale() {
  const entry = LANGUAGES.find((lang) => lang.id === currentLanguage);
  return entry?.locale ?? "en-US";
}

/**
 * @returns {string}
 */
export function getHtmlLang() {
  const entry = LANGUAGES.find((lang) => lang.id === currentLanguage);
  return entry?.htmlLang ?? "en";
}

/**
 * @returns {string}
 */
export function detectBrowserLanguage() {
  /** @type {string[]} */
  const candidates = navigator.languages?.length
    ? [...navigator.languages]
    : [navigator.language].filter(Boolean);

  for (const tag of candidates) {
    const primary = tag.toLowerCase().split("-")[0];
    if (isSupportedLanguage(primary)) return primary;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Uses saved preference when the user already chose a language;
 * otherwise falls back to the browser language (or English).
 * @returns {string}
 */
export function resolveInitialLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isSupportedLanguage(stored)) return stored;
  } catch {
    /* ignore */
  }
  return detectBrowserLanguage();
}

/**
 * @param {string} lang
 */
export function applyLanguage(lang) {
  currentLanguage = isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE;
}

/**
 * @param {string} lang
 */
export function setLanguage(lang) {
  applyLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, currentLanguage);
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 * @returns {string}
 */
export function t(key, params = {}) {
  const langMessages = MESSAGES[currentLanguage] ?? MESSAGES[DEFAULT_LANGUAGE];
  let message = langMessages[key] ?? MESSAGES[DEFAULT_LANGUAGE][key] ?? key;

  for (const [param, value] of Object.entries(params)) {
    message = message.replaceAll(`{${param}}`, String(value));
  }

  return message;
}

/**
 * @param {string} sessionName
 * @returns {string}
 */
export function getSessionLabel(sessionName) {
  const labels = SESSION_LABELS[currentLanguage] ?? SESSION_LABELS[DEFAULT_LANGUAGE];
  return labels[sessionName] ?? sessionName;
}

/**
 * @param {string} timezoneId
 * @returns {string}
 */
export function getTimezoneLabel(timezoneId) {
  const labels = TIMEZONE_LABELS[currentLanguage] ?? TIMEZONE_LABELS[DEFAULT_LANGUAGE];
  return labels[timezoneId] ?? timezoneId;
}

/** @type {readonly string[]} */
export const TIMEZONE_IDS = Object.keys(TIMEZONE_LABELS.pt);

/**
 * @param {import('./api.js').FetchError} error
 * @returns {string}
 */
export function translateFetchError(error) {
  if (error.code === "seasonLoadFailed") {
    return t("seasonLoadFailed", { year: error.params.year, status: error.params.status });
  }
  if (error.code === "noEventsFound") {
    return t("noEventsFound", { year: error.params.year });
  }
  if (error.code === "invalidResponse") {
    return t("invalidResponse", { year: error.params.year });
  }
  return t("genericLoadError");
}
