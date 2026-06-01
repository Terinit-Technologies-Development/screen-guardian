import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppInterventionManager from '../native/AppInterventionManager';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import * as Crypto from 'expo-crypto';

interface FocusSession {
    id: string;
    startedAt: string;
    endedAt: string | null;
    durationSeconds: number | null;
    completed: boolean;
    notes: string | null;
    deviceId: string | null;
}

interface FocusState {
    isActive: boolean;
    startTime: number | null;
    endTime: number | null;
    durationMinutes: number;
    whitelist: string[];
    currentFocusId: string | null;

    // Actions
    startFocus: (durationMinutes: number) => Promise<void>;
    stopFocus: () => Promise<void>;
    addToWhitelist: (packageName: string) => void;
    removeFromWhitelist: (packageName: string) => void;
    restoreState: () => void;
    loadFromCloud: () => Promise<void>;
}

// Default essential apps (Phone, Settings, SMS, Launcher)
// Note: Actual package names vary, but we can't block these easily anyway.
const DEFAULT_WHITELIST = [
    'com.android.settings',
    'com.google.android.dialer',
    'com.google.android.apps.messaging',
    'com.android.chrome', // Usually needed for webview auth, etc. Maybe remove for strict mode.
];

export const useFocusStore = create<FocusState>()(
    persist(
        (set, get) => ({
            isActive: false,
            startTime: null,
            endTime: null,
            durationMinutes: 30,
            whitelist: [...DEFAULT_WHITELIST],
            currentFocusId: null,

            startFocus: async (durationMinutes) => {
                const now = Date.now();
                const endTime = now + durationMinutes * 60 * 1000;
                const focusId = Crypto.randomUUID();

                set({
                    isActive: true,
                    startTime: now,
                    endTime: endTime,
                    durationMinutes,
                    currentFocusId: focusId,
                });

                // Sync to Native
                if (Platform.OS === 'android') {
                    await AppInterventionManager.setDeepFocusState(true, endTime);
                    await AppInterventionManager.setDeepFocusWhitelist(get().whitelist);
                }

                // Sync to cloud
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('focus_sessions').insert({
                            id: focusId,
                            user_id: session.user.id,
                            started_at: new Date(now).toISOString(),
                            completed: false,
                            device_id: Platform.OS === 'android' ? 'android-device' : null,
                        });
                    }
                } catch (e) {
                    console.error('Failed to sync focus session start to cloud:', e);
                }
            },

            stopFocus: async () => {
                const { startTime, currentFocusId } = get();
                const endTime = Date.now();
                const durationSeconds = startTime ? Math.floor((endTime - startTime) / 1000) : null;

                set({
                    isActive: false,
                    startTime: null,
                    endTime: null,
                });

                if (Platform.OS === 'android') {
                    await AppInterventionManager.setDeepFocusState(false, 0);
                }

                // Sync to cloud
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user && currentFocusId) {
                        await supabase.from('focus_sessions')
                            .update({
                                ended_at: new Date(endTime).toISOString(),
                                duration_seconds: durationSeconds,
                                completed: true,
                            })
                            .eq('id', currentFocusId)
                            .eq('user_id', session.user.id);
                    }
                } catch (e) {
                    console.error('Failed to sync focus session end to cloud:', e);
                }
            },

            addToWhitelist: (packageName) => {
                const { whitelist } = get();
                if (!whitelist.includes(packageName)) {
                    const newList = [...whitelist, packageName];
                    set({ whitelist: newList });
                    if (get().isActive && Platform.OS === 'android') {
                        AppInterventionManager.setDeepFocusWhitelist(newList);
                    }
                }
            },

            removeFromWhitelist: (packageName) => {
                const { whitelist } = get();
                const newList = whitelist.filter(p => p !== packageName);
                set({ whitelist: newList });
                if (get().isActive && Platform.OS === 'android') {
                    AppInterventionManager.setDeepFocusWhitelist(newList);
                }
            },

            restoreState: () => {
                const { isActive, endTime } = get();
                if (isActive && endTime && Date.now() > endTime) {
                    get().stopFocus();
                }
            },

            loadFromCloud: async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) return;

                    const { data, error } = await supabase
                        .from('focus_sessions')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('created_at', { ascending: false })
                        .limit(30);

                    if (!error && data) {
                        // Focus sessions are loaded for analytics purposes only
                        // The current active session state is managed locally
                        console.log(`Loaded ${data.length} focus sessions from cloud`);
                    }
                } catch (e) {
                    console.error('Failed to load focus sessions from cloud:', e);
                }
            },
        }),
        {
            name: 'screen-guardian-focus',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: (state) => {
                return (hydratedState) => {
                    hydratedState?.restoreState();
                }
            }
        }
    )
);
