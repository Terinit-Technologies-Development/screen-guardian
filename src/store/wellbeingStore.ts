import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { AppClassification, calculateAppStateEffects, FunctionalCategory, WellbeingEffects, WellbeingState } from '../types/wellbeing';
import { queueAchievementEvaluation } from '../services/achievementEvaluationService';

const defaultEffects: WellbeingEffects = {
  screenTime: -1,
  habits: 1,
  reading: 1,
  gaming: 0.4,
  social: -0.8,
};

const defaultStates: WellbeingState[] = [
  {
    id: 'balanced',
    label: 'Balanced Day',
    isActive: true,
    effects: defaultEffects,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    isActive: false,
    effects: { screenTime: -1.4, habits: 1.2, reading: 1.1, gaming: 0.1, social: -1.4 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'recovery',
    label: 'Recovery',
    isActive: false,
    effects: { screenTime: -0.6, habits: 0.8, reading: 1, gaming: 0.8, social: -0.6 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'lock-in',
    label: 'Lock-IN',
    isActive: false,
    effects: { screenTime: -1.8, habits: 1.4, reading: 1.2, gaming: -0.5, social: -2 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

interface WellbeingStore {
  classifications: Record<string, AppClassification>;
  states: WellbeingState[];
  classifyApp: (appId: string, appName: string, updates: Partial<AppClassification>) => Promise<void>;
  setActiveState: (stateId: string) => Promise<void>;
  updateStateEffect: (stateId: string, key: keyof WellbeingEffects, value: number) => Promise<void>;
  loadFromCloud: () => Promise<void>;
}

export const useWellbeingStore = create<WellbeingStore>()(
  persist(
    (set, get) => ({
      classifications: {},
      states: defaultStates,

      classifyApp: async (appId, appName, updates) => {
        const now = Date.now();
        const current = get().classifications[appId];
        const next: AppClassification = {
          appId,
          appName,
          category: updates.category ?? current?.category ?? 'other',
          isGame: updates.isGame ?? current?.isGame ?? false,
          isMessaging: updates.isMessaging ?? current?.isMessaging ?? false,
          isDoomscrollRisk: updates.isDoomscrollRisk ?? current?.isDoomscrollRisk ?? false,
          heightenedRestriction: updates.heightenedRestriction ?? current?.heightenedRestriction ?? false,
          dailyTargetMinutes: updates.dailyTargetMinutes ?? current?.dailyTargetMinutes,
          stateEffects: undefined,
          updatedAt: now,
        };

        next.stateEffects = Object.fromEntries(
          get().states.map(state => [state.id, calculateAppStateEffects(next, state)])
        );

        set(state => ({ classifications: { ...state.classifications, [appId]: next } }));
        queueAchievementEvaluation();

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;
          await supabase.from('app_classifications').upsert({
            user_id: session.user.id,
            app_id: next.appId,
            app_name: next.appName,
            category: next.category,
            is_game: next.isGame,
            is_messaging: next.isMessaging,
            is_doomscroll_risk: next.isDoomscrollRisk,
            heightened_restriction: next.heightenedRestriction,
            daily_target_minutes: next.dailyTargetMinutes ?? null,
            state_effects: next.stateEffects ?? {},
            updated_at: new Date(now).toISOString(),
          }, { onConflict: 'user_id,app_id' });
        } catch (e) {
          console.error('Failed to sync app classification:', e);
        }
      },

      setActiveState: async (stateId) => {
        const updated = get().states.map(state => ({ ...state, isActive: state.id === stateId, updatedAt: Date.now() }));
        set({ states: updated });
        await syncStates(updated);
      },

      updateStateEffect: async (stateId, key, value) => {
        const updated = get().states.map(state => state.id === stateId
          ? { ...state, effects: { ...state.effects, [key]: value }, updatedAt: Date.now() }
          : state
        );
        set({ states: updated });
        await syncStates(updated);
      },

      loadFromCloud: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;

          const { data: appRows } = await supabase
            .from('app_classifications')
            .select('*')
            .eq('user_id', session.user.id);

          if (appRows) {
            const mapped: Record<string, AppClassification> = {};
            for (const row of appRows) {
              mapped[row.app_id] = {
                appId: row.app_id,
                appName: row.app_name ?? undefined,
                category: row.category as FunctionalCategory,
                isGame: row.is_game,
                isMessaging: row.is_messaging,
                isDoomscrollRisk: row.is_doomscroll_risk,
                heightenedRestriction: row.heightened_restriction,
                dailyTargetMinutes: row.daily_target_minutes ?? undefined,
                stateEffects: row.state_effects ?? undefined,
                updatedAt: new Date(row.updated_at).getTime(),
              };
            }
            set({ classifications: mapped });
          }

          const { data: stateRows } = await supabase
            .from('wellbeing_states')
            .select('*')
            .eq('user_id', session.user.id);

          if (stateRows && stateRows.length > 0) {
            const cloudStates = stateRows.map(row => ({
              id: row.id,
              label: row.label,
              isActive: row.is_active,
              effects: { ...defaultEffects, ...(row.effects ?? {}) },
              createdAt: new Date(row.created_at).getTime(),
              updatedAt: new Date(row.updated_at).getTime(),
            }));
            const mergedStates = [
              ...cloudStates,
              ...defaultStates.filter(defaultState => !cloudStates.some(state => state.label === defaultState.label)),
            ];
            set({
              states: mergedStates,
            });
          }
        } catch (e) {
          console.error('Failed to load wellbeing data:', e);
        }
      },
    }),
    {
      name: 'screen-guardian-wellbeing',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

async function syncStates(states: WellbeingState[]) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from('wellbeing_states').upsert(states.map(state => ({
      user_id: session.user.id,
      label: state.label,
      is_active: state.isActive,
      effects: state.effects,
      created_at: new Date(state.createdAt).toISOString(),
      updated_at: new Date(state.updatedAt).toISOString(),
    })), { onConflict: 'user_id,label' });
  } catch (e) {
    console.error('Failed to sync wellbeing states:', e);
  }
}
