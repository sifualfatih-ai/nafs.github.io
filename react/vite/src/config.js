// ---- KONFIG URL & API (tidak diubah) ----
export const BASE = "https://nafsflow.com/";
export const HERE = "https://nafsflow.com/react/vite/";

export const HOMEPAGE_URL = BASE;
export const LOGIN_URL  = BASE + `?login=1&r=${encodeURIComponent(HERE)}`;
export const LOGOUT_URL = BASE + `?logout=1&r=${encodeURIComponent(HERE)}`;

export const API_BASE = "https://nafsgithubio-production.up.railway.app";
export const DEFAULT_MODEL = "openai/gpt-4o-mini";
export const TENANT_ID = "public";
