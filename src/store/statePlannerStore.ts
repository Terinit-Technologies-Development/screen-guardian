import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlannerEntry, PlannerStateId, RecurringPattern, AppOverride, PLANNER_STATES, canModifyEntry, calculateFunctionalBalance, FunctionalBalance } from '../types/statePlanner';
import { supabase } from '../lib/supabase';
import { queueAchievementEvaluation } from '../services/achievementEvaluationService';

interface StatePlannerStore {
  entries: Record<string, PlannerEntry>;
  recurringPatterns: RecurringPattern[];
  activeStateId: PlannerStateId | null;

  setEntry: (date: string, stateId: PlannerStateId, overrides?: AppOverride[]) => void;
  removeEntry: (date: string) => void;
  updateAppOverride: (date: string, appId: string, override: Partial<AppOverride>) => void;
  removeAppOverride: (date: string, appId: string) => void;
  lockEntry: (date: string) => void;
  unlockEntry: (date: string) => void;
  setActiveState: (stateId: PlannerStateId) => void;
  addRecurringPattern: (pattern: Omit<RecurringPattern, 'id'>) => void;
  removeRecurringPattern: (id: string) => void;
  applyRecurringPatterns: () => void;
  getActiveStateForDate: (date: string) => PlannerStateId | null;
  getRestrictionsForToday: () => { stateId: PlannerStateId; entry: PlannerEntry | null };
  calculateBalance: (classifications: Record<string, any>, apps: Array<{ packageName: string; appName: string; timeInForeground: number; category?: string }>) => FunctionalBalance;
  loadFromCloud: () => Promise<void>;
}

export const useStatePlannerStore = create<StatePlannerStore>()(
  persist(
    (set, get) => ({
      entries: {},
      recurringPatterns: [],
      activeStateId: null,

      setEntry: (date, stateId, overrides = []) => {
        const existing = get().entries[date];
        if (existing && !canModifyEntry(existing)) return;
        const entry: PlannerEntry = {
          date,
          stateId,
          appOverrides: overrides,
          locked: stateId === 'lock-in',
        };
        set(state => ({ entries: { ...state.entries, [date]: entry } }));
        get().applyRecurringPatterns();
        queueAchievementEvaluation();
        syncEntry(entry);
      },

      removeEntry: (date) => {
        const existing = get().entries[date];
        if (existing && !canModifyEntry(existing)) return;
        set(state => {
          const { [date]: _, ...rest } = state.entries;
          return { entries: rest };
        });
        deleteEntry(date);
      },

      updateAppOverride: (date, appId, override) => {
        const entry = get().entries[date];
        if (!entry || !canModifyEntry(entry)) return;
        const stateDef = PLANNER_STATES.find(s => s.id === entry.stateId)!;
        const existingOverride = entry.appOverrides.find(o => o.appId === appId);
        let updatedOverrides: AppOverride[];
        if (existingOverride) {
          if (stateDef.enforcementLevel === 'absolute') return;
          updatedOverrides = entry.appOverrides.map(o =>
            o.appId === appId ? { ...o, ...override } : o
          );
        } else {
          updatedOverrides = [...entry.appOverrides, { appId, appName: override.appName ?? appId, category: override.category ?? 'other', ...override }];
        }
        const updated: PlannerEntry = { ...entry, appOverrides: updatedOverrides };
        set(state => ({ entries: { ...state.entries, [date]: updated } }));
        syncEntry(updated);
      },

      removeAppOverride: (date, appId) => {
        const entry = get().entries[date];
        if (!entry || !canModifyEntry(entry)) return;
        const updated: PlannerEntry = { ...entry, appOverrides: entry.appOverrides.filter(o => o.appId !== appId) };
        set(state => ({ entries: { ...state.entries, [date]: updated } }));
        syncEntry(updated);
      },

      lockEntry: (date) => {
        const entry = get().entries[date];
        if (!entry) return;
        const updated: PlannerEntry = { ...entry, locked: true };
        set(state => ({ entries: { ...state.entries, [date]: updated } }));
        syncEntry(updated);
      },

      unlockEntry: (date) => {
        const entry = get().entries[date];
        if (!entry) return;
        if (entry.stateId === 'lock-in') return;
        const updated: PlannerEntry = { ...entry, locked: false };
        set(state => ({ entries: { ...state.entries, [date]: updated } }));
        syncEntry(updated);
      },

      setActiveState: (stateId) => {
        set({ activeStateId: stateId });
        const today = new Date().toISOString().split('T')[0];
        const existing = get().entries[today];
        if (!existing) {
          get().setEntry(today, stateId);
        }
        syncActiveState(stateId);
      },

      addRecurringPattern: (pattern) => {
        const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newPattern: RecurringPattern = { ...pattern, id };
        set(state => ({ recurringPatterns: [...state.recurringPatterns, newPattern] }));
        get().applyRecurringPatterns();
        syncPattern(newPattern);
      },

      removeRecurringPattern: (id) => {
        set(state => ({ recurringPatterns: state.recurringPatterns.filter(p => p.id !== id) }));
        deletePattern(id);
      },

      applyRecurringPatterns: () => {
        const { entries, recurringPatterns } = get();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        let updated = { ...entries };

        for (const pattern of recurringPatterns) {
          const start = new Date(pattern.startDate);
          const end = pattern.endDate ? new Date(pattern.endDate) : new Date(today.getFullYear(), today.getMonth() + 3, 0);
          if (today < start || today > end) continue;

          const daysToFill = 90;
          for (let i = 0; i < daysToFill; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayOfWeek = d.getDay();

            if (!pattern.daysOfWeek.includes(dayOfWeek)) continue;
            if (updated[dateStr] && !canModifyEntry(updated[dateStr])) continue;

            updated[dateStr] = {
              date: dateStr,
              stateId: pattern.stateId,
              appOverrides: [...pattern.appOverrides],
              locked: pattern.stateId === 'lock-in',
            };
          }
        }

        set({ entries: updated });
      },

      getActiveStateForDate: (date) => {
        const entry = get().entries[date];
        return entry?.stateId ?? null;
      },

      getRestrictionsForToday: () => {
        const today = new Date().toISOString().split('T')[0];
        const entry = get().entries[today];
        const activeId = get().activeStateId;
        return {
          stateId: entry?.stateId ?? activeId ?? 'balanced',
          entry,
        };
      },

      calculateBalance: (classifications, apps) => {
        const today = new Date();
        const daysToShow = 30;
        const dates: PlannerEntry[] = [];
        const { entries } = get();

        for (let i = 0; i < daysToShow; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          const entry = entries[dateStr];
          if (entry) dates.push(entry);
        }

        return calculateFunctionalBalance(dates, classifications, apps);
      },

      loadFromCloud: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;

          const { data: plannerRows } = await supabase
            .from('state_planner_entries')
            .select('*')
            .eq('user_id', session.user.id);

          if (plannerRows) {
            const mapped: Record<string, PlannerEntry> = {};
            for (const row of plannerRows) {
              mapped[row.date] = {
                date: row.date,
                stateId: row.state_id as PlannerStateId,
                appOverrides: row.app_overrides ?? [],
                locked: row.locked ?? false,
              };
            }
            set({ entries: mapped });
          }

          const { data: patternRows } = await supabase
            .from('state_planner_patterns')
            .select('*')
            .eq('user_id', session.user.id);

          if (patternRows) {
            const patterns: RecurringPattern[] = patternRows.map(row => ({
              id: row.id,
              stateId: row.state_id as PlannerStateId,
              daysOfWeek: row.days_of_week ?? [],
              startDate: row.start_date,
              endDate: row.end_date,
              appOverrides: row.app_overrides ?? [],
            }));
            set({ recurringPatterns: patterns });
          }
        } catch (e) {
          console.error('Failed to load planner data:', e);
        }
      },
    }),
    {
      name: 'screen-guardian-state-planner',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

async function syncEntry(entry: PlannerEntry) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('state_planner_entries').upsert({
      user_id: session.user.id,
      date: entry.date,
      state_id: entry.stateId,
      app_overrides: entry.appOverrides,
      locked: entry.locked,
    }, { onConflict: 'user_id,date' });
  } catch (e) {
    console.error('Failed to sync planner entry:', e);
  }
}

async function deleteEntry(date: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('state_planner_entries').delete().eq('user_id', session.user.id).eq('date', date);
  } catch (e) {
    console.error('Failed to delete planner entry:', e);
  }
}

async function syncPattern(pattern: RecurringPattern) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('state_planner_patterns').upsert({
      id: pattern.id,
      user_id: session.user.id,
      state_id: pattern.stateId,
      days_of_week: pattern.daysOfWeek,
      start_date: pattern.startDate,
      end_date: pattern.endDate,
      app_overrides: pattern.appOverrides,
    }, { onConflict: 'id' });
  } catch (e) {
    console.error('Failed to sync planner pattern:', e);
  }
}

async function deletePattern(id: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('state_planner_patterns').delete().eq('id', id);
  } catch (e) {
    console.error('Failed to delete planner pattern:', e);
  }
}

async function syncActiveState(stateId: PlannerStateId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('user_settings').upsert({
      user_id: session.user.id,
      active_planner_state: stateId,
    }, { onConflict: 'user_id' });
  } catch (e) {
    console.error('Failed to sync active state:', e);
  }
}