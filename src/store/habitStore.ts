import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog, HabitLogStatus } from '../types/habits';
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';

interface HabitState {
    habits: Habit[];
    logs: Record<string, HabitLog>; // Keyed by habitId_date (e.g., "123_2026-05-14")
    isLoading: boolean;
    
    // Actions
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    removeHabit: (id: string) => void;
    logHabit: (habitId: string, date: string, status: HabitLogStatus, notes?: string) => void;
    getHabitStreak: (habitId: string) => number;
    loadFromCloud: () => Promise<void>;
}

export const useHabitStore = create<HabitState>()(
    persist(
        (set, get) => ({
            habits: [],
            logs: {},
            isLoading: false,

            addHabit: async (habit) => {
                const newHabit: Habit = {
                    ...habit,
                    id: Crypto.randomUUID(),
                    createdAt: Date.now(),
                };
                
                set(state => ({
                    habits: [...state.habits, newHabit],
                }));

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('habits').insert({
                            id: newHabit.id,
                            user_id: session.user.id,
                            title: newHabit.title,
                            description: newHabit.description,
                            type: newHabit.type,
                            frequency: newHabit.frequency,
                            icon: newHabit.icon,
                            color: newHabit.color,
                            is_screen_time_linked: newHabit.isScreenTimeLinked,
                            created_at: new Date(newHabit.createdAt).toISOString()
                        });
                    }
                } catch (e) {
                    console.error('Failed to sync habit to cloud:', e);
                }
            },

            updateHabit: async (id, updates) => {
                set(state => ({
                    habits: state.habits.map(h => 
                        h.id === id ? { ...h, ...updates } : h
                    ),
                }));

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const dbUpdates: any = {};
                        if (updates.title !== undefined) dbUpdates.title = updates.title;
                        if (updates.description !== undefined) dbUpdates.description = updates.description;
                        if (updates.type !== undefined) dbUpdates.type = updates.type;
                        if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
                        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
                        if (updates.color !== undefined) dbUpdates.color = updates.color;
                        if (updates.isScreenTimeLinked !== undefined) dbUpdates.is_screen_time_linked = updates.isScreenTimeLinked;

                        await supabase.from('habits')
                            .update(dbUpdates)
                            .eq('id', id)
                            .eq('user_id', session.user.id);
                    }
                } catch (e) {
                    console.error('Failed to sync habit update to cloud:', e);
                }
            },

            removeHabit: async (id) => {
                set(state => {
                    const newLogs = { ...state.logs };
                    // Clean up logs for this habit
                    Object.keys(newLogs).forEach(key => {
                        if (key.startsWith(`${id}_`)) {
                            delete newLogs[key];
                        }
                    });
                    
                    return {
                        habits: state.habits.filter(h => h.id !== id),
                        logs: newLogs,
                    };
                });

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('habits')
                            .delete()
                            .eq('id', id)
                            .eq('user_id', session.user.id);
                    }
                } catch (e) {
                    console.error('Failed to delete habit from cloud:', e);
                }
            },

            logHabit: async (habitId, date, status, notes) => {
                const key = `${habitId}_${date}`;
                const newLog: HabitLog = {
                    id: Crypto.randomUUID(),
                    habitId,
                    logDate: date,
                    status,
                    notes,
                    loggedAt: Date.now(),
                };
                
                set(state => ({
                    logs: {
                        ...state.logs,
                        [key]: newLog,
                    }
                }));

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('habit_logs').upsert({
                            id: newLog.id,
                            user_id: session.user.id,
                            habit_id: newLog.habitId,
                            log_date: newLog.logDate,
                            status: newLog.status,
                            notes: newLog.notes,
                            logged_at: new Date(newLog.loggedAt).toISOString()
                        }, { onConflict: 'habit_id,log_date' });
                    }
                } catch (e) {
                    console.error('Failed to sync habit log to cloud:', e);
                }
            },

            getHabitStreak: (habitId) => {
                // Simplistic streak calculation: count consecutive 'completed' days backwards from today
                const logs = get().logs;
                const habitLogs = Object.values(logs)
                    .filter(log => log.habitId === habitId)
                    .sort((a, b) => b.logDate.localeCompare(a.logDate));
                
                let streak = 0;
                for (const log of habitLogs) {
                    if (log.status === 'completed') {
                        streak++;
                    } else if (log.status === 'failed') {
                        break; // Stop counting streak
                    }
                    // if skipped, we just continue the loop without breaking or incrementing (streak preserved)
                }
                return streak;
            },

            loadFromCloud: async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) return;

                    const { data: habits, error: habitsError } = await supabase
                        .from('habits')
                        .select('*')
                        .eq('user_id', session.user.id);

                    if (!habitsError && habits) {
                        const mappedHabits: Habit[] = habits.map(h => ({
                            id: h.id,
                            title: h.title,
                            description: h.description,
                            type: h.type,
                            frequency: h.frequency,
                            icon: h.icon,
                            color: h.color,
                            isScreenTimeLinked: h.is_screen_time_linked,
                            createdAt: new Date(h.created_at).getTime(),
                        }));
                        set({ habits: mappedHabits });
                    }

                    const { data: logs, error: logsError } = await supabase
                        .from('habit_logs')
                        .select('*')
                        .eq('user_id', session.user.id);

                    if (!logsError && logs) {
                        const mappedLogs: Record<string, HabitLog> = {};
                        logs.forEach(l => {
                            const key = `${l.habit_id}_${l.log_date}`;
                            mappedLogs[key] = {
                                id: l.id,
                                habitId: l.habit_id,
                                logDate: l.log_date,
                                status: l.status,
                                notes: l.notes,
                                loggedAt: new Date(l.logged_at).getTime(),
                            };
                        });
                        set({ logs: mappedLogs });
                    }
                } catch (e) {
                    console.error('Failed to load habits from cloud:', e);
                }
            },
        }),
        {
            name: 'screen-guardian-habits',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
