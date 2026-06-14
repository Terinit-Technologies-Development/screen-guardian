export type AchievementCategory =
  | 'habits'
  | 'streaks'
  | 'work'
  | 'focus'
  | 'reading'
  | 'screen_time'
  | 'planning';

export type AchievementTier =
  | 'layer_1'
  | 'layer_2'
  | 'layer_3'
  | 'layer_4'
  | 'layer_5'
  | 'layer_6'
  | 'layer_7'
  | 'layer_8'
  | 'layer_9';

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
