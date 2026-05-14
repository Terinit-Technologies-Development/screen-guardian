import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkSession, PerceivedEffect } from '../types/work';
import * as Crypto from 'expo-crypto';

interface WorkState {
    activeSession: WorkSession | null;
    history: WorkSession[];
    isLoading: boolean;
    
    // Actions
    startSession: (title: string, category?: string, description?: string) => void;
    stopSession: (effect: PerceivedEffect, notes?: string) => void;
    cancelActiveSession: () => void;
    updateSessionHistory: (id: string, updates: Partial<WorkSession>) => void;
}

export const useWorkStore = create<WorkState>()(
    persist(
        (set, get) => ({
            activeSession: null,
            history: [],
            isLoading: false,

            startSession: (title, category, description) => {
                const newSession: WorkSession = {
                    id: Crypto.randomUUID(),
                    title,
                    category,
                    description,
                    startTime: Date.now(),
                    createdAt: Date.now(),
                };
                
                set({ activeSession: newSession });
            },

            stopSession: (effect, notes) => {
                const { activeSession } = get();
                if (!activeSession) return;
                
                const endTime = Date.now();
                const durationSeconds = Math.floor((endTime - activeSession.startTime) / 1000);
                
                const completedSession: WorkSession = {
                    ...activeSession,
                    description: notes ? (activeSession.description ? `${activeSession.description}\n\nNotes: ${notes}` : notes) : activeSession.description,
                    endTime,
                    durationSeconds,
                    perceivedEffect: effect,
                };
                
                set(state => ({
                    activeSession: null,
                    history: [completedSession, ...state.history],
                }));
            },

            cancelActiveSession: () => {
                set({ activeSession: null });
            },

            updateSessionHistory: (id, updates) => {
                set(state => ({
                    history: state.history.map(s => 
                        s.id === id ? { ...s, ...updates } : s
                    ),
                }));
            },
        }),
        {
            name: 'screen-guardian-work',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
