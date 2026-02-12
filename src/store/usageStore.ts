import { create } from 'zustand';
import { AppUsageData, DailySummary } from '../types/usage';
import MockDataService from '../services/MockDataService';

interface UsageState {
  totalScreenTime: number;
  todayApps: AppUsageData[];
  dailyLimit: number;
  isLimitExceeded: boolean;
  weeklyData: DailySummary[];
  lastUpdated: number;
  isLoading: boolean;
  error: string | null;
  extensionsUsedToday: number;

  loadTodayUsage: () => Promise<void>;
  loadWeeklyData: () => Promise<void>;
  refreshData: () => Promise<void>;
  setDailyLimit: (limit: number) => void;
  checkLimitExceeded: () => void;
  useExtension: () => void;
}

export const useUsageStore = create<UsageState>((set, get) => ({
  totalScreenTime: 0,
  todayApps: [],
  dailyLimit: 7200,
  isLimitExceeded: false,
  weeklyData: [],
  lastUpdated: Date.now(),
  isLoading: false,
  error: null,
  extensionsUsedToday: 0,

  loadTodayUsage: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const data = MockDataService.getTodayUsage();
      set({
        totalScreenTime: data.totalScreenTime,
        todayApps: data.apps,
        lastUpdated: Date.now(),
        isLoading: false,
      });
      get().checkLimitExceeded();
    } catch {
      set({ error: 'Failed to load usage data', isLoading: false });
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
    const data = MockDataService.refreshUsageData();
    set({
      totalScreenTime: data.totalScreenTime,
      todayApps: data.apps,
      lastUpdated: Date.now(),
    });
    get().checkLimitExceeded();
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
}));
