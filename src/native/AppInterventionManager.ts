import { NativeModules, Platform } from 'react-native';

const { AppInterventionManager: NativeModule } = NativeModules;

interface CooldownStatus {
    isActive: boolean;
    packageName: string;
    remainingSeconds?: number;
    endTime?: number;
}

interface ExtensionData {
    extensionsToday: number;
    packageName: string;
    date: string;
}

class AppInterventionService {
    async blockApp(packageName: string, message: string = 'Limit reached'): Promise<boolean> {
        if (Platform.OS === 'ios' || !NativeModule) {
            console.warn('Cannot block apps on this platform');
            return false;
        }

        try {
            const result = await NativeModule.blockApp(packageName, message);
            return result.success;
        } catch (error) {
            console.error('Block app failed:', error);
            throw error;
        }
    }

    async startCooldown(packageName: string, durationSeconds: number): Promise<boolean> {
        if (!NativeModule) return false;
        try {
            const result = await NativeModule.startCooldown(packageName, durationSeconds);
            return result.success;
        } catch (error) {
            console.error('Start cooldown failed:', error);
            throw error;
        }
    }

    async endCooldown(packageName: string): Promise<boolean> {
        if (!NativeModule) return false;
        try {
            const result = await NativeModule.endCooldown(packageName);
            return result.success;
        } catch (error) {
            console.error('End cooldown failed:', error);
            throw error;
        }
    }

    async isCooldownActive(packageName: string): Promise<CooldownStatus> {
        if (!NativeModule) return { isActive: false, packageName };
        try {
            return await NativeModule.isCooldownActive(packageName);
        } catch (error) {
            console.error('Check cooldown failed:', error);
            throw error;
        }
    }

    async getAllActiveCooldowns(): Promise<CooldownStatus[]> {
        if (!NativeModule) return [];
        try {
            return await NativeModule.getAllActiveCooldowns();
        } catch (error) {
            console.error('Get active cooldowns failed:', error);
            throw error;
        }
    }

    async recordExtension(packageName: string): Promise<ExtensionData> {
        if (!NativeModule) throw new Error('Native module unavailable');
        try {
            return await NativeModule.recordExtension(packageName);
        } catch (error) {
            console.error('Record extension failed:', error);
            throw error;
        }
    }

    async getExtensionsToday(packageName: string): Promise<ExtensionData> {
        if (!NativeModule) throw new Error('Native module unavailable');
        try {
            return await NativeModule.getExtensionsToday(packageName);
        } catch (error) {
            console.error('Get extensions failed:', error);
            throw error;
        }
    }
}

export default new AppInterventionService();
