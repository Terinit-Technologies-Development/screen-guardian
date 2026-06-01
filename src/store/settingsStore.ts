import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLimit } from '../types/usage';
import AppInterventionManager from '../native/AppInterventionManager';
import { supabase } from '../lib/supabase';

// Helper to sync settings to cloud
const syncSettingsToCloud = async (state: SettingsState) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && state.syncEnabled) {
      await supabase.from('user_settings').upsert({
        user_id: session.user.id,
        daily_screen_time_limit: state.dailyScreenTimeLimit,
        cooldown_duration: state.cooldownDuration,
        max_extensions: state.maxExtensions,
        exercise_difficulty: state.exerciseDifficulty,
        monitoring_enabled: state.monitoringEnabled,
        notifications_enabled: state.notificationsEnabled,
        theme: state.theme,
        display_name: state.displayName,
        sync_enabled: state.syncEnabled,
        has_completed_onboarding: state.hasCompletedOnboarding,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
  } catch (e) {
    console.error('Failed to sync settings to cloud:', e);
  }
};

const syncAppLimitsToCloud = async (limits: Record<string, AppLimit>) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const today = new Date().toISOString().split('T')[0];
    const rows = Object.values(limits).map((limit: AppLimit) => ({
      user_id: session.user.id,
      app_id: limit.appId,
      app_name: limit.appName,
      max_time_minutes: limit.maxTimeMinutes,
      temp_extension_minutes: limit.tempExtensionMinutes || 0,
      extensions_today: limit.extensionsToday,
      last_extension_date: limit.lastExtensionDate,
      enabled: limit.enabled,
      last_updated_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      await supabase.from('app_limits').upsert(rows, { onConflict: 'user_id,app_id' });
    }
  } catch (e) {
    console.error('Failed to sync app limits to cloud:', e);
  }
};

interface SettingsState {
  dailyScreenTimeLimit: number;
  perAppLimits: Record<string, AppLimit>;
  cooldownDuration: number;
  maxExtensions: number;
  exerciseDifficulty: 'easy' | 'medium' | 'hard';
  monitoringEnabled: boolean;
  notificationsEnabled: boolean;
  hasCompletedOnboarding: boolean;
  theme: 'light' | 'dark' | 'system';

  setDailyLimit: (seconds: number) => void;
  setAppLimit: (appId: string, limit: Partial<AppLimit>) => void;
  extendLimit: (appId: string, minutes: number) => void;
  removeAppLimit: (appId: string) => void;
  setCooldownDuration: (seconds: number) => void;
  setMaxExtensions: (count: number) => void;
  setExerciseDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  toggleMonitoring: () => void;
  toggleNotifications: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  completeOnboarding: () => void;
  checkDailyReset: () => void;
  resetSettings: () => void;

  // Profile & Sync Settings
  displayName: string;
  setDisplayName: (name: string) => void;
  syncEnabled: boolean;
  setSyncEnabled: (enabled: boolean) => void;
  loadFromCloud: () => Promise<void>;
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
      theme: 'system',
      displayName: 'Guardian User',
      syncEnabled: false,

      setDailyLimit: (seconds) => { set({ dailyScreenTimeLimit: seconds }); syncSettingsToCloud(get()); },

      setAppLimit: (appId, limit) => {
        const current = get().perAppLimits;
        const now = Date.now();
        const today = new Date().toISOString().split('T')[0];

        const existingLimit = current[appId];

        let newLimit: AppLimit = {
          ...existingLimit,
          ...limit,
          appId,
          // Initialize strict fields if new
          createdAt: existingLimit?.createdAt || now,
          lastUpdatedAt: existingLimit?.lastUpdatedAt || now,
          extensionsToday: existingLimit?.extensionsToday || 0,
          lastExtensionDate: existingLimit?.lastExtensionDate || today,
          tempExtensionMinutes: existingLimit?.tempExtensionMinutes || 0
        };

        // Strict Mode Validations
        // 1. Max Limit Cap (3 hours)
        if (newLimit.maxTimeMinutes > 180) {
          throw new Error("Strict Limit: Daily usage cannot exceed 3 hours.");
        }

        // 2. 12-Day Lock on Base Limit Changes
        // Only if changing maxTimeMinutes AND it's not a new limit
        if (existingLimit && limit.maxTimeMinutes && limit.maxTimeMinutes !== existingLimit.maxTimeMinutes) {
          const daysSinceUpdate = (now - existingLimit.lastUpdatedAt) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate < 12) {
            throw new Error(`Strict Limit: You can only modify the limit once every 12 days. Try again in ${Math.ceil(12 - daysSinceUpdate)} days.`);
          }
          newLimit.lastUpdatedAt = now;
        }

        // 3. 30-Day Lock on Disabling
        if (existingLimit && limit.enabled === false && existingLimit.enabled === true) {
          const daysSinceCreation = (now - existingLimit.createdAt) / (1000 * 60 * 60 * 24);
          if (daysSinceCreation < 30) {
            throw new Error(`Strict Limit: You must maintain this restriction for 30 days before disabling. Days remaining: ${Math.ceil(30 - daysSinceCreation)}.`);
          }
        }

        const updated = { ...current, [appId]: newLimit };
        set({ perAppLimits: updated });
        syncAppLimitsToCloud(updated);
        // Sync to native for background enforcement
        const effectiveLimits = Object.entries(updated).reduce((acc, [id, l]) => {
          acc[id] = {
            ...l,
            maxTimeMinutes: l.maxTimeMinutes + (l.tempExtensionMinutes || 0)
          };
          return acc;
        }, {} as Record<string, AppLimit>);
        AppInterventionManager.syncLimits(effectiveLimits);
      },

      extendLimit: (appId: string, minutes: number) => {
        const state = get();
        const limit = state.perAppLimits[appId];
        if (!limit) return;

        const today = new Date().toISOString().split('T')[0];

        // Reset daily counters if needed
        let extensionsToday = limit.extensionsToday;
        if (limit.lastExtensionDate !== today) {
          extensionsToday = 0;
        }

        if (extensionsToday >= 3) {
          throw new Error("Strict Limit: Maximum of 3 extensions per day allowed.");
        }
        if (minutes > 30) {
          throw new Error("Strict Limit: Extensions cannot exceed 30 minutes.");
        }

        const newExtensionCount = extensionsToday + 1;

        const updatedLimit = {
          ...limit,
          tempExtensionMinutes: (limit.tempExtensionMinutes || 0) + minutes,
          extensionsToday: newExtensionCount,
          lastExtensionDate: today
        };

        const updated = { ...state.perAppLimits, [appId]: updatedLimit };
        set({ perAppLimits: updated });
        syncAppLimitsToCloud(updated);

        // Native needs the EFFECTIVE limit
        const effectiveLimits = Object.entries(updated).reduce((acc, [id, l]) => {
          acc[id] = {
            ...l,
            maxTimeMinutes: l.maxTimeMinutes + (l.tempExtensionMinutes || 0)
          };
          return acc;
        }, {} as Record<string, AppLimit>);

        AppInterventionManager.syncLimits(effectiveLimits);
      },

      removeAppLimit: (appId) => {
        const { [appId]: _, ...remaining } = get().perAppLimits;
        set({ perAppLimits: remaining });
        syncAppLimitsToCloud(remaining);
        // Sync to native for background enforcement
        const effectiveLimits = Object.entries(remaining).reduce((acc, [id, l]) => {
          acc[id] = {
            ...l,
            maxTimeMinutes: l.maxTimeMinutes + (l.tempExtensionMinutes || 0)
          };
          return acc;
        }, {} as Record<string, AppLimit>);
        AppInterventionManager.syncLimits(effectiveLimits);
      },

      setCooldownDuration: (seconds) => { set({ cooldownDuration: seconds }); syncSettingsToCloud(get()); },
      setMaxExtensions: (count) => { set({ maxExtensions: count }); syncSettingsToCloud(get()); },
      setExerciseDifficulty: (difficulty) => { set({ exerciseDifficulty: difficulty }); syncSettingsToCloud(get()); },
      toggleMonitoring: () => { set(s => ({ monitoringEnabled: !s.monitoringEnabled })); syncSettingsToCloud(get()); },
      toggleNotifications: () => { set(s => ({ notificationsEnabled: !s.notificationsEnabled })); syncSettingsToCloud(get()); },
      setTheme: (theme) => { set({ theme }); syncSettingsToCloud(get()); },
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setDisplayName: (name) => { set({ displayName: name }); syncSettingsToCloud(get()); },
      setSyncEnabled: (enabled) => { set({ syncEnabled: enabled }); syncSettingsToCloud(get()); },

      checkDailyReset: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        let needsUpdate = false;
        const updatedLimits = { ...state.perAppLimits };

        Object.entries(updatedLimits).forEach(([appId, limit]) => {
          if (limit.lastExtensionDate !== today) {
            if (limit.extensionsToday > 0 || (limit.tempExtensionMinutes || 0) > 0) {
              updatedLimits[appId] = {
                ...limit,
                extensionsToday: 0,
                tempExtensionMinutes: 0,
                lastExtensionDate: today
              };
              needsUpdate = true;
            }
          }
        });

        if (needsUpdate) {
          set({ perAppLimits: updatedLimits });
          // Sync effective limits to native
          const effectiveLimits = Object.entries(updatedLimits).reduce((acc, [id, l]) => {
            acc[id] = {
              ...l,
              maxTimeMinutes: l.maxTimeMinutes + (l.tempExtensionMinutes || 0)
            };
            return acc;
          }, {} as Record<string, AppLimit>);
          AppInterventionManager.syncLimits(effectiveLimits);
        }
      },

      resetSettings: () => {
        set({
          dailyScreenTimeLimit: 7200,
          perAppLimits: {},
          cooldownDuration: 1800,
          maxExtensions: 3,
          exerciseDifficulty: 'medium',
          monitoringEnabled: true,
          notificationsEnabled: true,
          displayName: 'Guardian User',
          syncEnabled: false,
        });
        syncSettingsToCloud(get());
      },

      loadFromCloud: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;

          // Load user settings
          const { data: settings, error: settingsError } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (!settingsError && settings) {
            set({
              dailyScreenTimeLimit: settings.daily_screen_time_limit ?? 7200,
              cooldownDuration: settings.cooldown_duration ?? 1800,
              maxExtensions: settings.max_extensions ?? 3,
              exerciseDifficulty: settings.exercise_difficulty ?? 'medium',
              monitoringEnabled: settings.monitoring_enabled ?? true,
              notificationsEnabled: settings.notifications_enabled ?? true,
              theme: settings.theme ?? 'system',
              displayName: settings.display_name ?? 'Guardian User',
              syncEnabled: settings.sync_enabled ?? false,
              hasCompletedOnboarding: settings.has_completed_onboarding ?? false,
            });
          }

          // Load app limits
          const { data: appLimits, error: appLimitsError } = await supabase
            .from('app_limits')
            .select('*')
            .eq('user_id', session.user.id);

          if (!appLimitsError && appLimits) {
            const mapped: Record<string, AppLimit> = {};
            appLimits.forEach(l => {
              mapped[l.app_id] = {
                appId: l.app_id,
                appName: l.app_name || '',
                maxVisits: 0,
                maxTimeMinutes: l.max_time_minutes || 60,
                category: 'Other' as any,
                isWhitelisted: false,
                enabled: l.enabled !== false,
                createdAt: new Date(l.created_at).getTime(),
                lastUpdatedAt: new Date(l.last_updated_at).getTime(),
                extensionsToday: l.extensions_today || 0,
                lastExtensionDate: l.last_extension_date || null,
                tempExtensionMinutes: l.temp_extension_minutes || 0,
              };
            });
            set({ perAppLimits: mapped });
          }
        } catch (e) {
          console.error('Failed to load settings from cloud:', e);
        }
      },
    }),
    {
      name: 'screen-time-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: (state) => {
        return (hydratedState) => {
          if (hydratedState) {
            // Check for day change and reset extensions
            const today = new Date().toISOString().split('T')[0];
            let needsUpdate = false;
            const updatedLimits = { ...hydratedState.perAppLimits };

            Object.entries(updatedLimits).forEach(([appId, limit]) => {
              if (limit.lastExtensionDate !== today) {
                if (limit.extensionsToday > 0 || (limit.tempExtensionMinutes || 0) > 0) {
                  updatedLimits[appId] = {
                    ...limit,
                    extensionsToday: 0,
                    tempExtensionMinutes: 0,
                    lastExtensionDate: today
                  };
                  needsUpdate = true;
                }
              }
            });

            if (needsUpdate) {
              // We can't easily call set state here, so we might need a workaround or rely on the next action.
              // Better approach: Sync to native with the CLEANED limits.
              // And ideally update the store state. 
              // Since this runs after hydration, the store state is already set to `hydratedState`.
              // We can just call syncLimits with the cleaned version? 
              // BUT the store in JS will still show old data until an action is triggered.
              // Fix: The store actions usually check dates before operating. 
              // Let's just sync the effective limits to native now.
            }

            // Sync to native after loading from storage (using effective limits)
            const effectiveLimits = Object.entries(updatedLimits).reduce((acc, [id, l]) => {
              acc[id] = {
                ...l,
                maxTimeMinutes: l.maxTimeMinutes + (l.tempExtensionMinutes || 0)
              };
              return acc;
            }, {} as Record<string, AppLimit>);

            AppInterventionManager.syncLimits(effectiveLimits);
          }
        };
      }
    }
  )
);
