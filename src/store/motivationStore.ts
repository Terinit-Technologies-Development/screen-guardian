import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Motivation } from '../types/motivations';
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';

interface MotivationState {
    motivations: Motivation[];
    isLoading: boolean;
    
    // Actions
    addMotivation: (motivation: Omit<Motivation, 'id' | 'createdAt' | 'displayOrder'>) => void;
    updateMotivation: (id: string, updates: Partial<Motivation>) => void;
    removeMotivation: (id: string) => void;
    reorderMotivations: (orderedIds: string[]) => void;
    loadFromCloud: () => Promise<void>;
}

export const useMotivationStore = create<MotivationState>()(
    persist(
        (set, get) => ({
            motivations: [],
            isLoading: false,

            addMotivation: async (motivation) => {
                const newMotivation: Motivation = {
                    ...motivation,
                    id: Crypto.randomUUID(),
                    createdAt: Date.now(),
                    displayOrder: get().motivations.length,
                };
                
                set(state => ({
                    motivations: [...state.motivations, newMotivation],
                }));

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('motivations').insert({
                            id: newMotivation.id,
                            user_id: session.user.id,
                            title: newMotivation.title,
                            description: newMotivation.description,
                            image_url: newMotivation.imageUrl,
                            display_order: newMotivation.displayOrder,
                            created_at: new Date(newMotivation.createdAt).toISOString()
                        });
                    }
                } catch (e) {
                    console.error('Failed to sync motivation to cloud:', e);
                }
            },

            updateMotivation: async (id, updates) => {
                set(state => ({
                    motivations: state.motivations.map(m => 
                        m.id === id ? { ...m, ...updates } : m
                    ),
                }));

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const dbUpdates: any = { updated_at: new Date().toISOString() };
                        if (updates.title !== undefined) dbUpdates.title = updates.title;
                        if (updates.description !== undefined) dbUpdates.description = updates.description;
                        if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
                        if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;

                        await supabase.from('motivations')
                            .update(dbUpdates)
                            .eq('id', id)
                            .eq('user_id', session.user.id);
                    }
                } catch (e) {
                    console.error('Failed to sync motivation update to cloud:', e);
                }
            },

            removeMotivation: async (id) => {
                set(state => ({
                    motivations: state.motivations.filter(m => m.id !== id),
                }));

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('motivations')
                            .delete()
                            .eq('id', id)
                            .eq('user_id', session.user.id);
                    }
                } catch (e) {
                    console.error('Failed to delete motivation from cloud:', e);
                }
            },

            reorderMotivations: async (orderedIds) => {
                set(state => {
                    const orderedMotivations = orderedIds.map((id, index) => {
                        const m = state.motivations.find(m => m.id === id)!;
                        return { ...m, displayOrder: index };
                    }).filter(Boolean);
                    
                    return { motivations: orderedMotivations };
                });

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const { motivations } = get();
                        // Upsert or bulk update
                        const updates = motivations.map(m => ({
                            id: m.id,
                            user_id: session.user.id,
                            title: m.title,
                            description: m.description,
                            image_url: m.imageUrl,
                            display_order: m.displayOrder,
                        }));
                        await supabase.from('motivations').upsert(updates, { onConflict: 'id' });
                    }
                } catch (e) {
                    console.error('Failed to sync reordered motivations to cloud:', e);
                }
            },

            loadFromCloud: async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) return;

                    const { data, error } = await supabase
                        .from('motivations')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('display_order', { ascending: true });

                    if (!error && data) {
                        const mapped: Motivation[] = data.map(m => ({
                            id: m.id,
                            title: m.title,
                            description: m.description,
                            imageUrl: m.image_url,
                            displayOrder: m.display_order,
                            createdAt: new Date(m.created_at).getTime(),
                            updatedAt: m.updated_at ? new Date(m.updated_at).getTime() : undefined,
                        }));
                        set({ motivations: mapped });
                    }
                } catch (e) {
                    console.error('Failed to load motivations from cloud:', e);
                }
            },
        }),
        {
            name: 'screen-guardian-motivations',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
