import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as KeepAwake from 'expo-keep-awake';
import { useSettingsStore } from '../src/store/settingsStore';
import { useAuthStore } from '../src/store/authStore';
import { useColorScheme } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import '../src/global.css';

import { Appearance, Text, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    const theme = useSettingsStore((s: any) => s.theme);
    const { session, isInitialized, isEmailVerified, initialize } = useAuthStore();
    const { colorScheme, setColorScheme } = useColorScheme();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const applyTheme = () => {
            const resolvedTheme = theme === 'system' ? (Appearance.getColorScheme() ?? 'light') : theme;
            setColorScheme(resolvedTheme);
        };

        applyTheme();

        if (theme !== 'system') return;

        const subscription = Appearance.addChangeListener(applyTheme);
        return () => subscription.remove();
    }, [theme, setColorScheme]);

    useEffect(() => {
        // Silently handle keep-awake activation to prevent uncaught promise errors
        // during development or on devices with strict power management.
        const silencer = async () => {
            try {
                await KeepAwake.activateKeepAwakeAsync();
            } catch (e) {
                // Ignore failure
            }
        };
        silencer();
    }, []);

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!isInitialized) return;

        const routeSegments = segments as unknown as string[];
        const inAuthGroup = routeSegments[0] === 'auth';
        const authRoute = routeSegments[1];

        if (!session && !inAuthGroup) {
            router.replace('/auth/login' as any);
            return;
        }

        if (session && !isEmailVerified && authRoute !== 'verify-email' && authRoute !== 'callback') {
            router.replace('/auth/verify-email' as any);
            return;
        }

        if (session && isEmailVerified && inAuthGroup && authRoute !== 'reset-password' && authRoute !== 'callback') {
            router.replace('/(tabs)');
        }
    }, [isInitialized, isEmailVerified, router, segments, session]);

    if (!isInitialized) {
        return (
            <SafeAreaProvider>
                <View className="flex-1 items-center justify-center bg-background">
                    <Text className="text-foreground font-bold">Loading Screen Guardian...</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <View style={{ flex: 1 }} className={colorScheme === 'dark' ? 'dark' : ''}>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </View>
        </SafeAreaProvider>
    );
}
