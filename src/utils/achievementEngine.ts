import { format, parseISO, subDays } from 'date-fns';
import { AchievementDefinition, AchievementMetrics, AchievementProgress } from '../types/achievements';
import { Habit, HabitLog } from '../types/habits';
import { WorkCard, WorkSession } from '../types/work';
import { AppUsageData, DailySummary } from '../types/usage';
import { AppClassification, isAppClassificationComplete } from '../types/wellbeing';
import { ReadingDailyLog } from '../types/reading';

const DAY_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

type MetricInput = {
  habits: Habit[];
  habitLogs: Record<string, HabitLog>;
  workCards: WorkCard[];
  workSessions: WorkSession[];
  todayApps: AppUsageData[];
  allApps: { packageName: string; appName?: string }[];
  classifications: Record<string, AppClassification>;
  weeklyData: DailySummary[];
  dailyLimit: number;
  totalScreenTime: number;
  readingDailyLogs: Record<string, ReadingDailyLog>;
};

function isScheduledDay(habit: Habit, dateStr: string) {
  if (habit.frequency === 'daily') return true;
  if (!habit.routineDays || habit.routineDays.length === 0) return true;
  const dayName = DAY_MAP[parseISO(dateStr).getDay()];
  return habit.routineDays.includes(dayName);
}

export function calculateHabitStreak(habit: Habit, logs: Record<string, HabitLog>, now = new Date()) {
  const todayStr = format(now, 'yyyy-MM-dd');
  let streak = 0;
  let cursor = now;

  for (let i = 0; i < 400; i++) {
    const dateStr = format(cursor, 'yyyy-MM-dd');
    const log = logs[`${habit.id}_${dateStr}`];

    if (!isScheduledDay(habit, dateStr)) {
      cursor = subDays(cursor, 1);
      continue;
    }

    if (dateStr !== todayStr && !log) break;

    if (log?.status === 'completed') {
      streak++;
    } else if (log?.status === 'skipped') {
      cursor = subDays(cursor, 1);
      continue;
    } else if (dateStr !== todayStr || log?.status === 'failed') {
      break;
    }

    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function createAchievementMetrics(input: MetricInput, now = new Date()): AchievementMetrics {
  const todayStr = format(now, 'yyyy-MM-dd');
  const logs = Object.values(input.habitLogs);
  const completedLogs = logs.filter(log => log.status === 'completed');
  const completedHabitDays = new Set(completedLogs.map(log => log.logDate));
  const todayHabitCompleted = completedLogs.some(log => log.logDate === todayStr);
  const todayWorkLogged = input.workSessions.some(session => format(session.startTime, 'yyyy-MM-dd') === todayStr && (session.durationSeconds ?? 0) > 0);
  const totalWorkSeconds = input.workSessions.reduce((sum, session) => sum + (session.durationSeconds ?? 0), 0);
  const productiveWorkDays = new Set(input.workSessions.filter(session => (session.durationSeconds ?? 0) > 0).map(session => format(session.startTime, 'yyyy-MM-dd'))).size;
  const readingLogs = Object.values(input.readingDailyLogs).filter(log => log.pagesRead > 0 || log.durationSeconds > 0);
  const totalReadingSeconds = readingLogs.reduce((sum, log) => sum + log.durationSeconds, 0);
  const configuredApps = input.allApps.filter(app => isAppClassificationComplete(input.classifications[app.packageName])).length;
  const configuredAppPercent = input.allApps.length > 0 ? Math.round((configuredApps / input.allApps.length) * 100) : 0;
  const doomscrollSeconds = input.todayApps.reduce((sum, app) => {
    const classification = input.classifications[app.packageName];
    return classification?.isDoomscrollRisk || classification?.category === 'social'
      ? sum + app.timeInForeground
      : sum;
  }, 0);
  const doomscrollFreeToday = doomscrollSeconds <= 10 * 60 ? 1 : 0;
  const underLimitDates = new Set(input.weeklyData.filter(day => !day.limitExceeded).map(day => day.date));
  if (input.totalScreenTime <= input.dailyLimit) underLimitDates.add(todayStr);
  const daysUnderScreenLimit = underLimitDates.size;
  const bestBuildHabitStreak = input.habits
    .filter(habit => habit.type === 'build')
    .reduce((max, habit) => Math.max(max, calculateHabitStreak(habit, input.habitLogs, now)), 0);
  const bestQuitHabitStreak = input.habits
    .filter(habit => habit.type === 'quit')
    .reduce((max, habit) => Math.max(max, calculateHabitStreak(habit, input.habitLogs, now)), 0);
  const intentionalTodayScore = [todayHabitCompleted, todayWorkLogged, doomscrollFreeToday === 1].filter(Boolean).length;

  return {
    totalHabitCompletions: completedLogs.length,
    totalHabitLogDays: completedHabitDays.size,
    bestBuildHabitStreak,
    bestQuitHabitStreak,
    totalWorkCardsCreated: input.workCards.length,
    totalWorkCardsCompleted: input.workCards.filter(card => card.status === 'completed').length,
    totalWorkHours: Number((totalWorkSeconds / 3600).toFixed(1)),
    productiveWorkDays,
    readingDays: readingLogs.length,
    totalReadingMinutes: Math.round(totalReadingSeconds / 60),
    daysUnderScreenLimit,
    doomscrollFreeToday,
    configuredAppPercent,
    intentionalTodayScore,
  };
}

export function getAchievementProgress(definition: AchievementDefinition, metrics: AchievementMetrics, isUnlocked = false): AchievementProgress {
  const value = metrics[definition.metric] ?? 0;
  return {
    achievementId: definition.id,
    value,
    target: definition.target,
    ratio: definition.target > 0 ? Math.min(1, value / definition.target) : 0,
    isUnlocked: isUnlocked || value >= definition.target,
  };
}

export function getUnlockedAchievementIds(definitions: AchievementDefinition[], metrics: AchievementMetrics) {
  return definitions.filter(definition => getAchievementProgress(definition, metrics).isUnlocked).map(definition => definition.id);
}
