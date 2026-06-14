import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkSession, PerceivedEffect, WorkCard } from '../types/work';
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';
import { queueAchievementEvaluation } from '../services/achievementEvaluationService';

interface WorkState {
    activeSession: WorkSession | null;
    history: WorkSession[];
    cards: WorkCard[];
    isLoading: boolean;
    
    // Actions
    createCard: (card: Omit<WorkCard, 'id' | 'status' | 'actualSeconds' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    startCard: (cardId: string) => void;
    updateCard: (id: string, updates: Partial<WorkCard>) => Promise<void>;
    completeCard: (id: string) => Promise<void>;
    startSession: (title: string, category?: string, description?: string, workCardId?: string) => void;
    stopSession: (effect: PerceivedEffect, notes?: string) => void;
    cancelActiveSession: () => void;
    updateSessionHistory: (id: string, updates: Partial<WorkSession>) => void;
    loadFromCloud: () => Promise<void>;
}

export const useWorkStore = create<WorkState>()(
    persist(
        (set, get) => ({
            activeSession: null,
            history: [],
            cards: [],
            isLoading: false,

            createCard: async (card) => {
                const now = Date.now();
                const newCard: WorkCard = {
                    ...card,
                    id: Crypto.randomUUID(),
                    status: 'planned',
                    actualSeconds: 0,
                    createdAt: now,
                    updatedAt: now,
                };
                set(state => ({ cards: [newCard, ...state.cards] }));
                queueAchievementEvaluation();

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('work_cards').insert({
                            id: newCard.id,
                            user_id: session.user.id,
                            title: newCard.title,
                            description: newCard.description ?? null,
                            category: newCard.category ?? null,
                            estimated_minutes: newCard.estimatedMinutes,
                            due_at: newCard.dueAt ? new Date(newCard.dueAt).toISOString() : null,
                            status: newCard.status,
                            actual_seconds: newCard.actualSeconds,
                            created_at: new Date(newCard.createdAt).toISOString(),
                            updated_at: new Date(newCard.updatedAt).toISOString(),
                        });
                    }
                } catch (e) {
                    console.error('Failed to sync work card:', e);
                }
            },

            startCard: (cardId) => {
                const card = get().cards.find(c => c.id === cardId);
                if (!card) return;
                get().startSession(card.title, card.category, card.description, card.id);
                get().updateCard(card.id, { status: 'active' });
            },

            updateCard: async (id, updates) => {
                const updatedAt = Date.now();
                set(state => ({
                    cards: state.cards.map(card => card.id === id ? { ...card, ...updates, updatedAt } : card),
                }));

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const dbUpdates: any = { updated_at: new Date(updatedAt).toISOString() };
                        if (updates.title !== undefined) dbUpdates.title = updates.title;
                        if (updates.description !== undefined) dbUpdates.description = updates.description;
                        if (updates.category !== undefined) dbUpdates.category = updates.category;
                        if (updates.estimatedMinutes !== undefined) dbUpdates.estimated_minutes = updates.estimatedMinutes;
                        if (updates.dueAt !== undefined) dbUpdates.due_at = updates.dueAt ? new Date(updates.dueAt).toISOString() : null;
                        if (updates.status !== undefined) dbUpdates.status = updates.status;
                        if (updates.actualSeconds !== undefined) dbUpdates.actual_seconds = updates.actualSeconds;
                        await supabase.from('work_cards').update(dbUpdates).eq('id', id).eq('user_id', session.user.id);
                    }
                } catch (e) {
                    console.error('Failed to sync work card update:', e);
                }
            },

            completeCard: async (id) => {
                await get().updateCard(id, { status: 'completed' });
                queueAchievementEvaluation();
            },

            startSession: (title, category, description, workCardId) => {
                const newSession: WorkSession = {
                    id: Crypto.randomUUID(),
                    title,
                    category,
                    description,
                    workCardId,
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
                    cards: completedSession.workCardId
                        ? state.cards.map(card => card.id === completedSession.workCardId
                            ? {
                                ...card,
                                status: 'planned',
                                actualSeconds: card.actualSeconds + durationSeconds,
                                updatedAt: endTime,
                            }
                            : card
                        )
                        : state.cards,
                }));
                queueAchievementEvaluation();

                if (completedSession.workCardId) {
                    const card = get().cards.find(c => c.id === completedSession.workCardId);
                    if (card) {
                        get().updateCard(card.id, { actualSeconds: card.actualSeconds, status: 'planned' });
                    }
                }

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
                            work_card_id: completedSession.workCardId ?? null,
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
                        if (updates.workCardId !== undefined) dbUpdates.work_card_id = updates.workCardId;

                        await supabase.from('work_sessions')
                            .update(dbUpdates)
                            .eq('id', id)
                            .eq('user_id', session.user.id);
                    }
                } catch (e) {
                    console.error('Failed to sync work session update to cloud:', e);
                }
            },

            loadFromCloud: async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) return;

                    const { data, error } = await supabase
                        .from('work_sessions')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('created_at', { ascending: false })
                        .limit(50);

                    if (!error && data) {
                        const mapped: WorkSession[] = data.map(s => ({
                            id: s.id,
                            title: s.title,
                            description: s.description,
                            category: s.category,
                            startTime: new Date(s.start_time).getTime(),
                            endTime: s.end_time ? new Date(s.end_time).getTime() : undefined,
                            durationSeconds: s.duration_seconds,
                            perceivedEffect: s.perceived_effect,
                            workCardId: s.work_card_id ?? undefined,
                            createdAt: new Date(s.created_at).getTime(),
                        }));
                        set({ history: mapped });
                    }

                    const { data: cardData, error: cardError } = await supabase
                        .from('work_cards')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('due_at', { ascending: true, nullsFirst: false });

                    if (!cardError && cardData) {
                        const mappedCards: WorkCard[] = cardData.map(c => ({
                            id: c.id,
                            title: c.title,
                            description: c.description ?? undefined,
                            category: c.category ?? undefined,
                            estimatedMinutes: c.estimated_minutes,
                            dueAt: c.due_at ? new Date(c.due_at).getTime() : undefined,
                            status: c.status,
                            actualSeconds: c.actual_seconds,
                            createdAt: new Date(c.created_at).getTime(),
                            updatedAt: new Date(c.updated_at).getTime(),
                        }));
                        set({ cards: mappedCards });
                    }
                } catch (e) {
                    console.error('Failed to load work sessions from cloud:', e);
                }
            },
        }),
        {
            name: 'screen-guardian-work',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
