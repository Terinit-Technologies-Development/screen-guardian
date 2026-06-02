export type AchievementCategory =
  | 'habits'
  | 'streaks'
  | 'work'
  | 'focus'
  | 'reading'
  | 'screen_time'
  | 'planning';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'legend';

export type AchievementMetricKey =
  | 'totalHabitCompletions'
  | 'totalHabitLogDays'
  | 'bestBuildHabitStreak'
  | 'bestQuitHabitStreak'
  | 'totalWorkCardsCreated'
  | 'totalWorkCardsCompleted'
  | 'totalWorkHours'
  | 'productiveWorkDays'
  | 'readingDays'
  | 'totalReadingMinutes'
  | 'daysUnderScreenLimit'
  | 'doomscrollFreeToday'
  | 'configuredAppPercent'
  | 'intentionalTodayScore';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  metric: AchievementMetricKey;
  target: number;
  icon: string;
  color: string;
  rewardText: string;
}

export interface AchievementProgress {
  achievementId: string;
  value: number;
  target: number;
  ratio: number;
  isUnlocked: boolean;
}

export interface UserAchievement {
  achievementId: string;
  progressValue: number;
  unlockedAt: number;
  seenAt?: number;
}

export type AchievementMetrics = Record<AchievementMetricKey, number>;
