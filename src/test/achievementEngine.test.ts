import { describe, expect, it } from 'vitest';
import { createAchievementMetrics, getAchievementProgress } from '../utils/achievementEngine';
import { ACHIEVEMENTS } from '../utils/achievementDefinitions';
import { Habit, HabitLog } from '../types/habits';

const now = new Date('2026-06-02T12:00:00Z');

function baseInput(overrides: Partial<Parameters<typeof createAchievementMetrics>[0]> = {}) {
  return {
    habits: [],
    habitLogs: {},
    workCards: [],
    workSessions: [],
    todayApps: [],
    allApps: [],
    classifications: {},
    weeklyData: [],
    dailyLimit: 7200,
    totalScreenTime: 0,
    readingDailyLogs: {},
    ...overrides,
  };
}

describe('achievementEngine', () => {
  it('calculates build and quit streak metrics from completed logs', () => {
    const buildHabit: Habit = {
      id: 'build-1',
      title: 'Read',
      type: 'build',
      frequency: 'daily',
      icon: 'CheckCircle',
      color: '#10b981',
      isScreenTimeLinked: false,
      createdAt: now.getTime(),
    };
    const quitHabit: Habit = {
      id: 'quit-1',
      title: 'No relapse',
      type: 'quit',
      frequency: 'daily',
      icon: 'XCircle',
      color: '#ef4444',
      isScreenTimeLinked: false,
      createdAt: now.getTime(),
    };
    const logs: Record<string, HabitLog> = {
      'build-1_2026-06-02': { id: '1', habitId: 'build-1', logDate: '2026-06-02', status: 'completed', loggedAt: now.getTime() },
      'build-1_2026-06-01': { id: '2', habitId: 'build-1', logDate: '2026-06-01', status: 'completed', loggedAt: now.getTime() },
      'quit-1_2026-06-02': { id: '3', habitId: 'quit-1', logDate: '2026-06-02', status: 'completed', loggedAt: now.getTime() },
      'quit-1_2026-06-01': { id: '4', habitId: 'quit-1', logDate: '2026-06-01', status: 'completed', loggedAt: now.getTime() },
      'quit-1_2026-05-31': { id: '5', habitId: 'quit-1', logDate: '2026-05-31', status: 'failed', loggedAt: now.getTime() },
    };

    const metrics = createAchievementMetrics(baseInput({ habits: [buildHabit, quitHabit], habitLogs: logs }), now);

    expect(metrics.bestBuildHabitStreak).toBe(2);
    expect(metrics.bestQuitHabitStreak).toBe(2);
    expect(metrics.totalHabitCompletions).toBe(4);
  });

  it('tracks doomscroll-free and intentional-day metrics', () => {
    const metrics = createAchievementMetrics(baseInput({
      habitLogs: {
        'habit_2026-06-02': { id: '1', habitId: 'habit', logDate: '2026-06-02', status: 'completed', loggedAt: now.getTime() },
      },
      workSessions: [{ id: 'work', title: 'Build', startTime: now.getTime(), durationSeconds: 3600, createdAt: now.getTime() }],
      todayApps: [{ packageName: 'social', appName: 'Social', timeInForeground: 500, lastTimeUsed: now.getTime() }],
      classifications: {
        social: {
          appId: 'social',
          category: 'social',
          isGame: false,
          isMessaging: false,
          isDoomscrollRisk: true,
          heightenedRestriction: true,
          updatedAt: now.getTime(),
        },
      },
    }), now);

    expect(metrics.doomscrollFreeToday).toBe(1);
    expect(metrics.intentionalTodayScore).toBe(3);
  });

  it('reports achievement progress against targets', () => {
    const definition = ACHIEVEMENTS.find(item => item.id === 'work_hours_10');
    expect(definition).toBeTruthy();
    const progress = getAchievementProgress(definition!, { ...createAchievementMetrics(baseInput(), now), totalWorkHours: 5 });

    expect(progress.ratio).toBe(0.5);
    expect(progress.isUnlocked).toBe(false);
  });
});
