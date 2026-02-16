import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppInterventionManager from '../native/AppInterventionManager';
import { Platform } from 'react-native';

interface FocusState {
    isActive: boolean;
    startTime: number | null;
    endTime: number | null;
    durationMinutes: number;
    whitelist: string[];

    // Actions
    startFocus: (durationMinutes: number) => Promise<void>;
    stopFocus: () => Promise<void>;
    addToWhitelist: (packageName: string) => void;
    removeFromWhitelist: (packageName: string) => void;
    restoreState: () => void;
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

            startFocus: async (durationMinutes) => {
                const now = Date.now();
                const endTime = now + durationMinutes * 60 * 1000;

                set({
                    isActive: true,
                    startTime: now,
                    endTime: endTime,
                    durationMinutes,
                });

                // Sync to Native
                if (Platform.OS === 'android') {
                    await AppInterventionManager.setDeepFocusState(true, endTime);
                    // Sync whitelist too if needed, though native might just check basic essentials first
                    await AppInterventionManager.setDeepFocusWhitelist(get().whitelist);
                }
            },

            stopFocus: async () => {
                set({
                    isActive: false,
                    startTime: null,
                    endTime: null,
                });

                if (Platform.OS === 'android') {
                    await AppInterventionManager.setDeepFocusState(false, 0);
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
                    // Expired while app was closed
                    get().stopFocus();
                }
            }
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
