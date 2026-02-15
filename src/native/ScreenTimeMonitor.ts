import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { UsageData, AuthorizationResult } from '../types/usage';

const { ScreenTimeMonitor: NativeModule } = NativeModules;

class ScreenTimeMonitorService {
    private eventEmitter: NativeEventEmitter | null = null;

    constructor() {
        if (Platform.OS === 'android' && NativeModule) {
            this.eventEmitter = new NativeEventEmitter(NativeModule);
        }
    }

    async requestAuthorization(): Promise<AuthorizationResult> {
        if (!NativeModule) return { authorized: false, status: 'unavailable' };
        try {
            return await NativeModule.requestAuthorization();
        } catch (error) {
            console.error('Authorization failed:', error);
            throw error;
        }
    }

    async checkAuthorization(): Promise<AuthorizationResult> {
        if (!NativeModule) return { authorized: false, status: 'unavailable' };
        try {
            return await NativeModule.checkAuthorization();
        } catch (error) {
            console.error('Check authorization failed:', error);
            throw error;
        }
    }

    async checkAccessibilityPermission(): Promise<AuthorizationResult> {
        if (!NativeModule) return { authorized: false, status: 'unavailable' };
        try {
            return await NativeModule.checkAccessibilityPermission();
        } catch (error) {
            console.error('Check accessibility failed:', error);
            throw error;
        }
    }

    async requestAccessibilityPermission(): Promise<AuthorizationResult> {
        if (!NativeModule) return { authorized: false, status: 'unavailable' };
        try {
            return await NativeModule.requestAccessibilityPermission();
        } catch (error) {
            console.error('Request accessibility failed:', error);
            throw error;
        }
    }

    async getTodayUsage(): Promise<UsageData> {
        if (!NativeModule) throw new Error('Native module unavailable');
        try {
            return await NativeModule.getTodayUsage();
        } catch (error) {
            if (Platform.OS === 'ios') {
                // iOS limitation
                console.warn('iOS: Cannot access Screen Time data directly');
                throw new Error('iOS_RESTRICTED');
            }
            throw error;
        }
    }

    async getInstalledApps(): Promise<any[]> {
        if (!NativeModule) return [];
        try {
            return await NativeModule.getInstalledApps();
        } catch (error) {
            console.error('Failed to get installed apps:', error);
            return [];
        }
    }

    async startMonitoring(): Promise<{ monitoring: boolean }> {
        if (!NativeModule) return { monitoring: false };
        try {
            return await NativeModule.startMonitoring();
        } catch (error) {
            console.error('Start monitoring failed:', error);
            throw error;
        }
    }

    async stopMonitoring(): Promise<{ monitoring: boolean }> {
        if (!NativeModule) return { monitoring: false };
        try {
            return await NativeModule.stopMonitoring();
        } catch (error) {
            console.error('Stop monitoring failed:', error);
            throw error;
        }
    }

    // Event listeners (Android focus for now)
    onUsageUpdate(callback: (data: UsageData) => void) {
        if (this.eventEmitter) {
            return this.eventEmitter.addListener('usageUpdate', callback);
        }
        return { remove: () => { } };
    }

    onLimitWarning(callback: (data: any) => void) {
        if (this.eventEmitter) {
            return this.eventEmitter.addListener('limitWarning', callback);
        }
        return { remove: () => { } };
    }
}

export default new ScreenTimeMonitorService();
