/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for API endpoints */
  readonly VITE_APP_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
