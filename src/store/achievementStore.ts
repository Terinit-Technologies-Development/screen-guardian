import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { AchievementMetrics, AchievementProgress, UserAchievement } from '../types/achievements';
import { ACHIEVEMENTS } from '../utils/achievementDefinitions';
import { createAchievementMetrics, getAchievementProgress } from '../utils/achievementEngine';
import { useHabitStore } from './habitStore';
import { useWorkStore } from './workStore';
import { useUsageStore } from './usageStore';
import { useWellbeingStore } from './wellbeingStore';
import { useReadingStore } from './readingStore';

interface AchievementState {
  unlocked: Record<string, UserAchievement>;
  latestUnlocks: UserAchievement[];
  isLoading: boolean;
  lastEvaluatedAt?: number;
  evaluateAchievements: () => Promise<UserAchievement[]>;
  getMetrics: () => AchievementMetrics;
  getProgress: () => AchievementProgress[];
  markAchievementSeen: (achievementId: string) => Promise<void>;
  clearLatestUnlocks: () => void;
  loadFromCloud: () => Promise<void>;
}

function readMetricsFromStores() {
  const habitState = useHabitStore.getState();
  const workState = useWorkStore.getState();
  const usageState = useUsageStore.getState();
  const wellbeingState = useWellbeingStore.getState();
  const readingState = useReadingStore.getState();

  return createAchievementMetrics({
    habits: habitState.habits,
    habitLogs: habitState.logs,
    workCards: workState.cards,
    workSessions: workState.history,
    todayApps: usageState.todayApps,
    allApps: usageState.allApps,
    classifications: wellbeingState.classifications,
    weeklyData: usageState.weeklyData,
    dailyLimit: usageState.dailyLimit,
    totalScreenTime: usageState.totalScreenTime,
    readingDailyLogs: readingState.dailyLogs,
  });
}

async function syncUnlockedAchievements(unlocks: UserAchievement[]) {
  if (unlocks.length === 0) return;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from('user_achievements').upsert(
      unlocks.map(unlock => ({
        user_id: session.user.id,
        achievement_id: unlock.achievementId,
        progress_value: unlock.progressValue,
        unlocked_at: new Date(unlock.unlockedAt).toISOString(),
        seen_at: unlock.seenAt ? new Date(unlock.seenAt).toISOString() : null,
        metadata: {},
      })),
      { onConflict: 'user_id,achievement_id' }
    );
  } catch (e) {
    console.error('Failed to sync achievements:', e);
  }
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      latestUnlocks: [],
      isLoading: false,

      evaluateAchievements: async () => {
        const metrics = readMetricsFromStores();
        const now = Date.now();
        const unlocked = get().unlocked;
        const nextUnlocks = ACHIEVEMENTS
          .filter(definition => !unlocked[definition.id])
          .map(definition => ({ definition, progress: getAchievementProgress(definition, metrics) }))
          .filter(item => item.progress.isUnlocked)
          .map(item => ({
            achievementId: item.definition.id,
            progressValue: item.progress.value,
            unlockedAt: now,
          }));

        if (nextUnlocks.length > 0) {
          set(state => {
            const merged = { ...state.unlocked };
            for (const unlock of nextUnlocks) merged[unlock.achievementId] = unlock;
            return {
              unlocked: merged,
              latestUnlocks: [...nextUnlocks, ...state.latestUnlocks].slice(0, 5),
              lastEvaluatedAt: now,
            };
          });
          await syncUnlockedAchievements(nextUnlocks);
        } else {
          set({ lastEvaluatedAt: now });
        }

        return nextUnlocks;
      },

      getMetrics: () => readMetricsFromStores(),

      getProgress: () => {
        const metrics = readMetricsFromStores();
        const unlocked = get().unlocked;
        return ACHIEVEMENTS.map(definition => getAchievementProgress(definition, metrics, !!unlocked[definition.id]));
      },

      markAchievementSeen: async (achievementId) => {
        const seenAt = Date.now();
        set(state => ({
          unlocked: state.unlocked[achievementId]
            ? {
                ...state.unlocked,
                [achievementId]: { ...state.unlocked[achievementId], seenAt },
              }
            : state.unlocked,
          latestUnlocks: state.latestUnlocks.filter(unlock => unlock.achievementId !== achievementId),
        }));

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;
          await supabase.from('user_achievements')
            .update({ seen_at: new Date(seenAt).toISOString() })
            .eq('user_id', session.user.id)
            .eq('achievement_id', achievementId);
        } catch (e) {
          console.error('Failed to mark achievement seen:', e);
        }
      },

      clearLatestUnlocks: () => set({ latestUnlocks: [] }),

      loadFromCloud: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;
          set({ isLoading: true });

          const { data, error } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', session.user.id);

          if (!error && data) {
            const mapped: Record<string, UserAchievement> = {};
            for (const row of data) {
              mapped[row.achievement_id] = {
                achievementId: row.achievement_id,
                progressValue: row.progress_value ?? 0,
                unlockedAt: new Date(row.unlocked_at).getTime(),
                seenAt: row.seen_at ? new Date(row.seen_at).getTime() : undefined,
              };
            }
            set(state => ({ unlocked: { ...state.unlocked, ...mapped } }));
          }
        } catch (e) {
          console.error('Failed to load achievements from cloud:', e);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'screen-guardian-achievements',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        unlocked: state.unlocked,
        lastEvaluatedAt: state.lastEvaluatedAt,
      }),
    }
  )
);
