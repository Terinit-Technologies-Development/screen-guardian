import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Dynamic Expo config that reads environment variables at build time.
 * All `extra` fields are accessible in TS/JS via `src/config/env.ts`.
 *
 * To add a new env var:
 * 1. Add it to .env.example and .env
 * 2. Expose it via `extra` below
 * 3. Add a typed accessor in src/config/env.ts
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Screen Guardian',
  slug: 'screen-guardian',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.ANDROID_PACKAGE_NAME ?? 'com.screentimeapp',
  },
  android: {
    package: process.env.ANDROID_PACKAGE_NAME ?? 'com.screentimeapp',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },

  // ─── Environment variables exposed to JS/TS ─────────────────────────────
  extra: {
    // App environment ('development' | 'staging' | 'production')
    appEnv: process.env.APP_ENV ?? 'development',

    // Backend / Supabase
    backendUrl: process.env.BACKEND_URL ?? '',
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',

    // AI features
    aiApiKey: process.env.AI_API_KEY ?? '',
    aiProvider: process.env.AI_PROVIDER ?? 'openai',

    // Android native config (also injected into native build via this config)
    androidMonitoringIntervalMs: parseInt(
      process.env.ANDROID_MONITORING_INTERVAL_MS ?? '5000',
      10
    ),

    // EAS project linking
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? '',
    },
  },
});
