export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

/** Duração estimada de cada sessão em minutos (para o arquivo .ics). */
export const SESSION_DURATIONS = {
  FirstPractice: 60,
  SecondPractice: 60,
  ThirdPractice: 60,
  Qualifying: 60,
  Sprint: 45,
  SprintQualifying: 45,
  Race: 120,
};

export const CURRENT_YEAR = new Date().getFullYear();
export const MIN_YEAR = 2000;
export const MAX_YEAR = CURRENT_YEAR + 1;

/** Quantos anos voltar ao buscar último vencedor em circuitos sem histórico recente. */
export const STATS_LOOKBACK_YEARS = 10;

export const API_BASE = "https://api.jolpi.ca/ergast/f1";
