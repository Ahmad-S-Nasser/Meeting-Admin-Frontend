/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHBOARD_API_URL: string;
  readonly VITE_COON_MEETING_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
