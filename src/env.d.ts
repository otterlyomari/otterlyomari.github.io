/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
interface ImportMetaEnv {
    readonly CF_API_TOKEN: string;
  readonly CF_ACCOUNT_ID: string;
  readonly CF_PROJECT_NAME: string;
}