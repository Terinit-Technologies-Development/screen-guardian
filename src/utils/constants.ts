export const APP_NAME = 'Screen Time Monitor';

export const DEFAULT_DAILY_LIMIT = 7200; // 2 hours in seconds

export const DEFAULT_COOLDOWN = 1800; // 30 minutes

export const MAX_EXTENSIONS_PER_DAY = 3;

export const EXTENSION_DURATION = 300; // 5 minutes

export const APP_CATEGORIES = [
  'Social',
  'Entertainment',
  'Productivity',
  'Games',
  'Health',
  'Other',
] as const;

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;

export const MOCK_APP_ICONS: Record<string, string> = {
  'com.instagram.android': '📷',
  'com.twitter.android': '🐦',
  'com.facebook.katana': '👥',
  'com.google.android.youtube': '📺',
  'com.whatsapp': '💬',
  'com.netflix.mediaclient': '🎬',
  'com.spotify.music': '🎵',
  'com.slack': '💼',
  'com.microsoft.teams': '👔',
  'default': '📱',
};
