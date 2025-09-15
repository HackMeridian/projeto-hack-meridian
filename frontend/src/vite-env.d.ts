/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SECRET_KEY: string | undefined;
  readonly VITE_CONTRACT_ID: string | undefined;
  readonly VITE_NETWORK?: string | undefined;
  readonly VITE_RPC_URL?: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
