import { create } from 'zustand';
import { Platform } from 'react-native';
import ScreenTimeMonitor from '../native/ScreenTimeMonitor';
import AppInterventionManager from '../native/AppInterventionManager';

interface PermissionStatus {
    usageStats: boolean;
    overlay: boolean;
    accessibility: boolean;
    notifications: boolean;
}

interface PermissionState {
    status: PermissionStatus;
    isLoading: boolean;
    lastChecked: number;
    checkAllPermissions: () => Promise<void>;
    requestUsageStats: () => Promise<void>;
    requestOverlay: () => Promise<void>;
    requestAccessibility: () => Promise<void>;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
    status: {
        usageStats: false,
        overlay: false,
        accessibility: false,
        notifications: false,
    },
    isLoading: false,
    lastChecked: 0,

    checkAllPermissions: async () => {
        if (Platform.OS !== 'android') return;

        set({ isLoading: true });
        try {
            const [usage, overlay, accessibility] = await Promise.all([
                ScreenTimeMonitor.checkAuthorization(),
                AppInterventionManager.checkOverlayPermission(),
                ScreenTimeMonitor.checkAccessibilityPermission()
            ]);

            set({
                status: {
                    usageStats: usage.authorized,
                    overlay: overlay.authorized,
                    accessibility: accessibility.authorized,
                    notifications: true, // Simplified for now, can add PermissionsAndroid check
                },
                lastChecked: Date.now(),
            });
        } catch (error) {
            console.error('Failed to check permissions:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    requestUsageStats: async () => {
        await ScreenTimeMonitor.requestAuthorization();
        // The check will happen when the user returns to the app
    },

    requestOverlay: async () => {
        await AppInterventionManager.requestOverlayPermission();
    },

    requestAccessibility: async () => {
        await ScreenTimeMonitor.requestAccessibilityPermission();
    },
}));
