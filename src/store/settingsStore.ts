import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLimit } from '../types/usage';

interface SettingsState {
  dailyScreenTimeLimit: number;
  perAppLimits: Record<string, AppLimit>;
  cooldownDuration: number;
  maxExtensions: number;
  exerciseDifficulty: 'easy' | 'medium' | 'hard';
  monitoringEnabled: boolean;
  notificationsEnabled: boolean;
  hasCompletedOnboarding: boolean;

  setDailyLimit: (seconds: number) => void;
  setAppLimit: (appId: string, limit: Partial<AppLimit>) => void;
  removeAppLimit: (appId: string) => void;
  setCooldownDuration: (seconds: number) => void;
  setMaxExtensions: (count: number) => void;
  setExerciseDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  toggleMonitoring: () => void;
  toggleNotifications: () => void;
  completeOnboarding: () => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      dailyScreenTimeLimit: 7200,
      perAppLimits: {},
      cooldownDuration: 1800,
      maxExtensions: 3,
      exerciseDifficulty: 'medium',
      monitoringEnabled: true,
      notificationsEnabled: true,
      hasCompletedOnboarding: false,

      setDailyLimit: (seconds) => set({ dailyScreenTimeLimit: seconds }),

      setAppLimit: (appId, limit) => {
        const current = get().perAppLimits;
        set({
          perAppLimits: {
            ...current,
            [appId]: { ...current[appId], ...limit, appId } as AppLimit,
          },
        });
      },

      removeAppLimit: (appId) => {
        const { [appId]: _, ...remaining } = get().perAppLimits;
        set({ perAppLimits: remaining });
      },

      setCooldownDuration: (seconds) => set({ cooldownDuration: seconds }),
      setMaxExtensions: (count) => set({ maxExtensions: count }),
      setExerciseDifficulty: (difficulty) => set({ exerciseDifficulty: difficulty }),
      toggleMonitoring: () => set(s => ({ monitoringEnabled: !s.monitoringEnabled })),
      toggleNotifications: () => set(s => ({ notificationsEnabled: !s.notificationsEnabled })),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      resetSettings: () => set({
        dailyScreenTimeLimit: 7200,
        perAppLimits: {},
        cooldownDuration: 1800,
        maxExtensions: 3,
        exerciseDifficulty: 'medium',
        monitoringEnabled: true,
        notificationsEnabled: true,
      }),
    }),
    {
      name: 'screen-time-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
