import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useSettingsStore } from '../src/store/settingsStore';
import { useColorScheme } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import '../src/global.css';

import { View } from 'react-native';

export default function RootLayout() {
    const theme = useSettingsStore((s: any) => s.theme);
    const { colorScheme, setColorScheme } = useColorScheme();

    useEffect(() => {
        if (theme) {
            console.log(`[Theme] Setting color scheme to: ${theme}`);
            setColorScheme(theme);
        }
    }, [theme]);

    return (
        <View style={{ flex: 1 }} className={colorScheme === 'dark' ? 'dark' : ''}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ presentation: 'modal' }} />
            </Stack>
        </View>
    );
}
