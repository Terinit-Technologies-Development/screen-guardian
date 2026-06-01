import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog, HabitLogStatus, DayOfWeek, ALL_DAYS } from '../types/habits';
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';
import { format, addDays, subDays, parseISO } from 'date-fns';

const DAY_MAP: Record<number, DayOfWeek> = {
    0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
};

function isScheduledDay(habit: Habit, dateStr: string): boolean {
    if (habit.frequency === 'daily') return true;
    if (!habit.routineDays || habit.routineDays.length === 0) return true;
    const dayIndex = parseISO(dateStr).getDay();
    const dayName = DAY_MAP[dayIndex];
    return habit.routineDays.includes(dayName);
}

function getConsecutiveScheduledDaysBefore(habit: Habit, fromDate: Date): string[] {
    const dates: string[] = [];
    let cursor = fromDate;
    // Go back up to 400 days to find consecutive scheduled days
    for (let i = 0; i < 400; i++) {
        const dateStr = format(cursor, 'yyyy-MM-dd');
        if (isScheduledDay(habit, dateStr)) {
            dates.unshift(dateStr);
        }
        cursor = subDays(cursor, 1);
    }
    return dates.reverse(); // most recent first
}

interface HabitState {
    habits: Habit[];
    logs: Record<string, HabitLog>;
    isLoading: boolean;

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
                            description: newHabit.description ?? null,
                            type: newHabit.type,
                            frequency: newHabit.frequency,
                            routine_days: newHabit.routineDays ?? null,
                            icon: newHabit.icon,
                            color: newHabit.color,
                            is_screen_time_linked: newHabit.isScreenTimeLinked,
                            created_at: new Date(newHabit.createdAt).toISOString(),
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
                        const dbUpdates: Record<string, unknown> = {};
                        if (updates.title !== undefined) dbUpdates.title = updates.title;
                        if (updates.description !== undefined) dbUpdates.description = updates.description;
                        if (updates.type !== undefined) dbUpdates.type = updates.type;
                        if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
                        if (updates.routineDays !== undefined) dbUpdates.routine_days = updates.routineDays;
                        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
                        if (updates.color !== undefined) dbUpdates.color = updates.color;
                        if (updates.isScreenTimeLinked !== undefined) dbUpdates.is_screen_time_linked = updates.isScreenTimeLinked;

                        if (Object.keys(dbUpdates).length > 0) {
                            await supabase.from('habits')
                                .update(dbUpdates)
                                .eq('id', id)
                                .eq('user_id', session.user.id);
                        }
                    }
                } catch (e) {
                    console.error('Failed to sync habit update to cloud:', e);
                }
            },

            removeHabit: async (id) => {
                set(state => {
                    const newLogs = { ...state.logs };
                    Object.keys(newLogs).forEach(key => {
                        if (key.startsWith(`${id}_`)) delete newLogs[key];
                    });
                    return {
                        habits: state.habits.filter(h => h.id !== id),
                        logs: newLogs,
                    };
                });

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('habits').delete().eq('id', id).eq('user_id', session.user.id);
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
                    logs: { ...state.logs, [key]: newLog },
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
                            notes: newLog.notes ?? null,
                            logged_at: new Date(newLog.loggedAt).toISOString(),
                        }, { onConflict: 'habit_id,log_date' });
                    }
                } catch (e) {
                    console.error('Failed to sync habit log to cloud:', e);
                }
            },

            getHabitStreak: (habitId) => {
                const { habits, logs } = get();
                const habit = habits.find(h => h.id === habitId);
                if (!habit) return 0;

                const today = new Date();
                const todayStr = format(today, 'yyyy-MM-dd');

                // Walk backwards through consecutive scheduled days
                let streak = 0;
                let cursor = today;

                for (let i = 0; i < 400; i++) {
                    const dateStr = format(cursor, 'yyyy-MM-dd');

                    // Don't check today if it hasn't ended yet (give user chance to log)
                    if (dateStr === todayStr) {
                        cursor = subDays(cursor, 1);
                        continue;
                    }

                    if (!isScheduledDay(habit, dateStr)) {
                        cursor = subDays(cursor, 1);
                        continue;
                    }

                    const logKey = `${habitId}_${dateStr}`;
                    const log = logs[logKey];

                    if (!log) break; // no log = streak broken

                    if (log.status === 'completed') {
                        streak++;
                    } else if (log.status === 'skipped') {
                        // skipped doesn't break the streak for build habits
                        if (habit.type === 'build') {
                            cursor = subDays(cursor, 1);
                            continue;
                        }
                        streak++;
                    } else {
                        break; // failed = streak broken
                    }

                    cursor = subDays(cursor, 1);
                }

                // If today is a scheduled day and has been completed, add 1
                const todayLog = logs[`${habitId}_${todayStr}`];
                if (todayLog && todayLog.status === 'completed') {
                    streak++;
                }

                return streak;
            },

            loadFromCloud: async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) return;

                    set({ isLoading: true });

                    const { data: cloudHabits, error: habitsError } = await supabase
                        .from('habits')
                        .select('*')
                        .eq('user_id', session.user.id);

                    if (!habitsError && cloudHabits) {
                        const mapped: Habit[] = cloudHabits.map((h: Record<string, unknown>) => ({
                            id: h.id as string,
                            title: h.title as string,
                            description: (h.description as string) ?? undefined,
                            type: h.type as Habit['type'],
                            frequency: h.frequency as Habit['frequency'],
                            routineDays: (h.routine_days as DayOfWeek[]) ?? undefined,
                            icon: (h.icon as string) ?? 'Circle',
                            color: (h.color as string) ?? '#06b6d4',
                            isScreenTimeLinked: Boolean(h.is_screen_time_linked),
                            createdAt: new Date(h.created_at as string).getTime(),
                        }));
                        set({ habits: mapped });
                    }

                    const { data: cloudLogs, error: logsError } = await supabase
                        .from('habit_logs')
                        .select('*')
                        .eq('user_id', session.user.id);

                    if (!logsError && cloudLogs) {
                        const mappedLogs: Record<string, HabitLog> = {};
                        for (const l of cloudLogs) {
                            const key = `${l.habit_id}_${l.log_date}`;
                            mappedLogs[key] = {
                                id: l.id as string,
                                habitId: l.habit_id as string,
                                logDate: l.log_date as string,
                                status: l.status as HabitLogStatus,
                                notes: (l.notes as string) ?? undefined,
                                loggedAt: new Date(l.logged_at as string).getTime(),
                            };
                        }
                        set({ logs: mappedLogs });
                    }
                } catch (e) {
                    console.error('Failed to load habits from cloud:', e);
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'screen-guardian-habits',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
