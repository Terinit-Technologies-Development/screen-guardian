import Constants from 'expo-constants';

/**
 * Typed accessor for all environment variables used in the app.
 *
 * Values are sourced from `app.config.ts` `extra` block, which reads
 * from `.env` at build/start time via dotenv.
 *
 * Usage:
 *   import { ENV } from '@/config/env';
 *   const url = ENV.SUPABASE_URL;
 */

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

function requireString(key: string, fallback = ''): string {
  const val = extra[key];
  if (typeof val === 'string') return val;
  return fallback;
}

function requireNumber(key: string, fallback: number): number {
  const val = extra[key];
  if (typeof val === 'number') return val;
  return fallback;
}

export type AppEnv = 'development' | 'staging' | 'production';
export type AiProvider = 'openai' | 'gemini' | 'anthropic';

export const ENV = {
  /** Current environment: 'development' | 'staging' | 'production' */
  APP_ENV: requireString('appEnv', 'development') as AppEnv,

  /** Returns true when running in production */
  IS_PRODUCTION: requireString('appEnv') === 'production',

  /** Base URL for the backend API / Supabase project */
  BACKEND_URL: requireString('backendUrl'),

  /** Supabase project URL */
  SUPABASE_URL: requireString('supabaseUrl'),

  /** Supabase anonymous (publishable) key — safe to expose in client */
  SUPABASE_ANON_KEY: requireString('supabaseAnonKey'),

  /** AI API key (OpenAI / Gemini / etc.) — treat as sensitive */
  AI_API_KEY: requireString('aiApiKey'),

  /** AI provider identifier */
  AI_PROVIDER: requireString('aiProvider', 'openai') as AiProvider,

  /** Android MonitoringService polling interval in milliseconds */
  ANDROID_MONITORING_INTERVAL_MS: requireNumber('androidMonitoringIntervalMs', 5000),

  /** EAS project ID */
  EAS_PROJECT_ID: requireString('eas.projectId'),
} as const;
