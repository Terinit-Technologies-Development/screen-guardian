import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useSettingsStore } from '../src/store/settingsStore';
import '../src/global.css';

export default function RootLayout() {
    const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
    const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ presentation: 'modal' }} />
        </Stack>
    );
}
