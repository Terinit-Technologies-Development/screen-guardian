import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUsageData, DailySummary } from '../types/usage';
import { Platform } from 'react-native';
import ScreenTimeMonitor from '../native/ScreenTimeMonitor';
import MockDataService from '../services/MockDataService';
import { supabase } from '../lib/supabase';
import { ENV } from '../config/env';
import { queueAchievementEvaluation } from '../services/achievementEvaluationService';

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
  syncUsageToCloud: () => Promise<void>;
  syncDailyScreenTime: (totalSeconds: number, limitSeconds?: number) => Promise<void>;
  loadFromCloud: () => Promise<void>;
}

function mergeAppsByPackage(existingApps: any[], incomingApps: any[]) {
  const appsByPackage = new Map<string, any>();
  for (const app of existingApps) {
    if (app?.packageName) appsByPackage.set(app.packageName, app);
  }
  for (const app of incomingApps) {
    if (!app?.packageName) continue;
    const current = appsByPackage.get(app.packageName);
    appsByPackage.set(app.packageName, {
      ...current,
      ...app,
      appName: app.appName || current?.appName || app.packageName,
    });
  }
  return Array.from(appsByPackage.values()).sort((a, b) => (a.appName ?? a.packageName).localeCompare(b.appName ?? b.packageName));
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
            allApps: mergeAppsByPackage(get().allApps, data.apps),
            lastUpdated: Date.now(),
            isLoading: false,
          });
          queueAchievementEvaluation();
          get().checkLimitExceeded();

          // Sync to cloud after loading
          get().syncUsageToCloud();
          get().syncDailyScreenTime(data.totalScreenTime);
        } catch (error) {
          set({ error: 'Failed to load usage data', isLoading: false });
        }
      },

      loadAllApps: async () => {
        try {
          const apps = await ScreenTimeMonitor.getInstalledApps();
          set(state => ({ allApps: mergeAppsByPackage(apps, state.todayApps) }));
        } catch (error) {
          console.error('Failed to load all apps:', error);
          set(state => ({ allApps: mergeAppsByPackage(state.allApps, state.todayApps) }));
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

      syncUsageToCloud: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;

          const { todayApps } = get();
          if (todayApps.length === 0) return;

          const today = new Date().toISOString().split('T')[0];
          const snapshots = todayApps.map((app: AppUsageData) => ({
            user_id: session.user.id,
            app_id: app.packageName,
            app_name: app.appName,
            snapshot_date: today,
            usage_seconds: Math.round(app.timeInForeground),
            launch_count: Math.round(app.launchCount ?? 0),
            device_id: Platform.OS === 'android' ? 'android-device' : null,
            synced_at: new Date().toISOString(),
          }));

          const { error } = await supabase
            .from('usage_snapshots')
            .upsert(snapshots, { onConflict: 'user_id,snapshot_date,app_id,device_id' });

          if (error) {
            console.error('Failed to sync usage to cloud:', error);
          }
        } catch (e) {
          console.error('Failed to sync usage to cloud:', e);
        }
      },

      syncDailyScreenTime: async (totalSeconds: number, limitSeconds?: number) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;

          const today = new Date().toISOString().split('T')[0];
          await supabase.from('daily_screen_time_logs').upsert({
            user_id: session.user.id,
            log_date: today,
            total_seconds: Math.round(totalSeconds),
            limit_seconds: Math.round(limitSeconds ?? get().dailyLimit),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,log_date' });
        } catch (e) {
          console.error('Failed to sync daily screen time to cloud:', e);
        }
      },

      loadFromCloud: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;

          const today = new Date().toISOString().split('T')[0];

          // Load daily screen time logs for weekly charting
          const { data: dailyLogs, error: logsError } = await supabase
            .from('daily_screen_time_logs')
            .select('*')
            .eq('user_id', session.user.id)
            .order('log_date', { ascending: false })
            .limit(365);

          if (!logsError && dailyLogs && dailyLogs.length > 0) {
            const weeklySummaries: DailySummary[] = dailyLogs.map(log => ({
              date: log.log_date,
              totalScreenTime: log.total_seconds,
              totalVisits: 0,
              totalAppsUsed: 0,
              exercisesCompleted: 0,
              extensionsUsed: 0,
              limitExceeded: (log.limit_seconds && log.total_seconds >= log.limit_seconds) || false,
            }));
            set({ weeklyData: weeklySummaries });
          }
        } catch (e) {
          console.error('Failed to load usage from cloud:', e);
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
      }),
    }
  )
);
