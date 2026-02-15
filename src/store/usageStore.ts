import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUsageData, DailySummary } from '../types/usage';
import { Platform } from 'react-native';
import ScreenTimeMonitor from '../native/ScreenTimeMonitor';
import MockDataService from '../services/MockDataService';

interface UsageState {
  totalScreenTime: number;
  todayApps: AppUsageData[];
  allApps: any[];
  dailyLimit: number;
  isLimitExceeded: boolean;
  weeklyData: DailySummary[];
  lastUpdated: number;
  isLoading: boolean;
  error: string | null;
  extensionsUsedToday: number;
  isAuthorized: boolean;
  useRealData: boolean;

  // Actions
  checkAuthorization: () => Promise<void>;
  requestAuthorization: () => Promise<void>;
  loadTodayUsage: () => Promise<void>;
  loadAllApps: () => Promise<void>;
  loadWeeklyData: () => Promise<void>;
  refreshData: () => Promise<void>;
  setDailyLimit: (limit: number) => void;
  checkLimitExceeded: () => void;
  useExtension: () => void;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
}

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      totalScreenTime: 0,
      todayApps: [],
      allApps: [],
      dailyLimit: 7200,
      isLimitExceeded: false,
      weeklyData: [],
      lastUpdated: Date.now(),
      isLoading: false,
      error: null,
      extensionsUsedToday: 0,
      isAuthorized: false,
      useRealData: Platform.OS === 'android',

      checkAuthorization: async () => {
        try {
          const result = await ScreenTimeMonitor.checkAuthorization();
          set({ isAuthorized: result.authorized });
        } catch (error) {
          console.error('Check authorization failed:', error);
          set({ isAuthorized: false, useRealData: false });
        }
      },

      requestAuthorization: async () => {
        set({ isLoading: true });
        try {
          const result = await ScreenTimeMonitor.requestAuthorization();
          set({
            isAuthorized: result.authorized,
            isLoading: false
          });
        } catch (error) {
          set({
            error: 'Authorization failed',
            isLoading: false,
            isAuthorized: false,
            useRealData: false
          });
        }
      },

      loadTodayUsage: async () => {
        set({ isLoading: true, error: null });
        const { useRealData, isAuthorized } = get();

        try {
          let data;
          if (useRealData && isAuthorized) {
            try {
              data = await ScreenTimeMonitor.getTodayUsage();
            } catch (error) {
              console.warn('Failed to get real data, falling back to mock:', error);
              data = MockDataService.getTodayUsage();
            }
          } else {
            data = MockDataService.getTodayUsage();
          }

          set({
            totalScreenTime: data.totalScreenTime,
            todayApps: data.apps,
            lastUpdated: Date.now(),
            isLoading: false,
          });
          get().checkLimitExceeded();
        } catch (error) {
          set({ error: 'Failed to load usage data', isLoading: false });
        }
      },

      loadAllApps: async () => {
        try {
          const apps = await ScreenTimeMonitor.getInstalledApps();
          set({ allApps: apps });
        } catch (error) {
          console.error('Failed to load all apps:', error);
        }
      },

      loadWeeklyData: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 400));
          const weeklyData = MockDataService.getWeeklyData();
          set({ weeklyData, isLoading: false });
        } catch {
          set({ error: 'Failed to load weekly data', isLoading: false });
        }
      },

      refreshData: async () => {
        await Promise.all([
          get().loadTodayUsage(),
          get().loadAllApps()
        ]);
      },

      setDailyLimit: (limit: number) => {
        set({ dailyLimit: limit });
        get().checkLimitExceeded();
      },

      checkLimitExceeded: () => {
        const { totalScreenTime, dailyLimit } = get();
        set({ isLimitExceeded: totalScreenTime >= dailyLimit });
      },

      useExtension: () => {
        set(state => ({
          extensionsUsedToday: state.extensionsUsedToday + 1,
          dailyLimit: state.dailyLimit + 300,
        }));
        get().checkLimitExceeded();
      },

      startMonitoring: async () => {
        if (!get().isAuthorized) {
          await get().requestAuthorization();
        }
        try {
          await ScreenTimeMonitor.startMonitoring();
        } catch (error) {
          console.error('Failed to start monitoring:', error);
          throw error;
        }
      },

      stopMonitoring: async () => {
        try {
          await ScreenTimeMonitor.stopMonitoring();
        } catch (error) {
          console.error('Failed to stop monitoring:', error);
          throw error;
        }
      },
    }),
    {
      name: 'screen-time-usage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        dailyLimit: state.dailyLimit,
        extensionsUsedToday: state.extensionsUsedToday,
        lastUpdated: state.lastUpdated,
        // We don't persist volatile usage data, only settings/counters
      }),
    }
  )
);
