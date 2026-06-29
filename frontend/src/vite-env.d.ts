/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Backend origin for the deployed frontend, injected at build time.
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
