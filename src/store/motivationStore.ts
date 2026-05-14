import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Motivation } from '../types/motivations';
import * as Crypto from 'expo-crypto';

interface MotivationState {
    motivations: Motivation[];
    isLoading: boolean;
    
    // Actions
    addMotivation: (motivation: Omit<Motivation, 'id' | 'createdAt' | 'displayOrder'>) => void;
    updateMotivation: (id: string, updates: Partial<Motivation>) => void;
    removeMotivation: (id: string) => void;
    reorderMotivations: (orderedIds: string[]) => void;
}

export const useMotivationStore = create<MotivationState>()(
    persist(
        (set, get) => ({
            motivations: [],
            isLoading: false,

            addMotivation: (motivation) => {
                const newMotivation: Motivation = {
                    ...motivation,
                    id: Crypto.randomUUID(),
                    createdAt: Date.now(),
                    displayOrder: get().motivations.length,
                };
                
                set(state => ({
                    motivations: [...state.motivations, newMotivation],
                }));
            },

            updateMotivation: (id, updates) => {
                set(state => ({
                    motivations: state.motivations.map(m => 
                        m.id === id ? { ...m, ...updates } : m
                    ),
                }));
            },

            removeMotivation: (id) => {
                set(state => ({
                    motivations: state.motivations.filter(m => m.id !== id),
                }));
            },

            reorderMotivations: (orderedIds) => {
                set(state => {
                    const orderedMotivations = orderedIds.map((id, index) => {
                        const m = state.motivations.find(m => m.id === id)!;
                        return { ...m, displayOrder: index };
                    }).filter(Boolean);
                    
                    return { motivations: orderedMotivations };
                });
            },
        }),
        {
            name: 'screen-guardian-motivations',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
