import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useSettingsStore } from '../src/store/settingsStore';
import { useColorScheme } from 'nativewind';
import '../src/global.css';

export default function RootLayout() {
    const theme = useSettingsStore((s: any) => s.theme);
    const { setColorScheme } = useColorScheme();

    useEffect(() => {
        if (theme) {
            setColorScheme(theme);
        }
    }, [theme]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ presentation: 'modal' }} />
        </Stack>
    );
}
