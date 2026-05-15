import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkSession, PerceivedEffect } from '../types/work';
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';

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

            stopSession: async (effect, notes) => {
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

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('work_sessions').insert({
                            id: completedSession.id,
                            user_id: session.user.id,
                            title: completedSession.title,
                            category: completedSession.category,
                            description: completedSession.description,
                            start_time: new Date(completedSession.startTime).toISOString(),
                            end_time: new Date(completedSession.endTime!).toISOString(),
                            duration_seconds: completedSession.durationSeconds,
                            perceived_effect: completedSession.perceivedEffect,
                            created_at: new Date(completedSession.createdAt).toISOString()
                        });
                    }
                } catch (e) {
                    console.error('Failed to sync work session to cloud:', e);
                }
            },

            cancelActiveSession: () => {
                set({ activeSession: null });
            },

            updateSessionHistory: async (id, updates) => {
                set(state => ({
                    history: state.history.map(s => 
                        s.id === id ? { ...s, ...updates } : s
                    ),
                }));

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const dbUpdates: any = {};
                        if (updates.title !== undefined) dbUpdates.title = updates.title;
                        if (updates.category !== undefined) dbUpdates.category = updates.category;
                        if (updates.description !== undefined) dbUpdates.description = updates.description;
                        if (updates.perceivedEffect !== undefined) dbUpdates.perceived_effect = updates.perceivedEffect;

                        await supabase.from('work_sessions')
                            .update(dbUpdates)
                            .eq('id', id)
                            .eq('user_id', session.user.id);
                    }
                } catch (e) {
                    console.error('Failed to sync work session update to cloud:', e);
                }
            },
        }),
        {
            name: 'screen-guardian-work',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
