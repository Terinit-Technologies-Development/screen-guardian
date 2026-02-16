export interface AppUsageData {
  packageName: string;
  appName: string;
  appIcon?: string;
  timeInForeground: number; // seconds
  launchCount?: number;
  lastTimeUsed: number; // timestamp
  category?: AppCategory;
}

export interface AuthorizationResult {
  authorized: boolean;
  status: string;
  message?: string;
}

export interface UsageData {
  totalScreenTime: number; // seconds
  apps: AppUsageData[];
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export interface DailySummary {
  date: string;
  totalScreenTime: number;
  totalVisits: number;
  totalAppsUsed: number;
  exercisesCompleted: number;
  extensionsUsed: number;
  limitExceeded: boolean;
  mostUsedApp?: string;
}

export interface AppLimit {
  appId: string;
  appName: string;
  maxVisits: number;
  maxTimeMinutes: number;
  category: AppCategory;
  isWhitelisted: boolean;
  enabled: boolean;
}

export type AppCategory =
  | 'Social'
  | 'Entertainment'
  | 'Productivity'
  | 'Games'
  | 'Health'
  | 'Other';

export interface WeeklyStats {
  averageScreenTime: number;
  totalScreenTime: number;
  dailyBreakdown: DailySummary[];
  percentageChange: number;
  mostUsedApps: AppUsageData[];
}
