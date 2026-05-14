import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog, HabitLogStatus } from '../types/habits';
import * as Crypto from 'expo-crypto';

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
}

export const useHabitStore = create<HabitState>()(
    persist(
        (set, get) => ({
            habits: [],
            logs: {},
            isLoading: false,

            addHabit: (habit) => {
                const newHabit: Habit = {
                    ...habit,
                    id: Crypto.randomUUID(),
                    createdAt: Date.now(),
                };
                
                set(state => ({
                    habits: [...state.habits, newHabit],
                }));
            },

            updateHabit: (id, updates) => {
                set(state => ({
                    habits: state.habits.map(h => 
                        h.id === id ? { ...h, ...updates } : h
                    ),
                }));
            },

            removeHabit: (id) => {
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
            },

            logHabit: (habitId, date, status, notes) => {
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
        }),
        {
            name: 'screen-guardian-habits',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
