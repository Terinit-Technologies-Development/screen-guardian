import { Tabs } from 'expo-router';
import { Smartphone, Home, BarChart2, Settings, Dumbbell, BookOpen } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#06b6d4',
            tabBarInactiveTintColor: isDark ? '#525252' : '#a3a3a3',
            tabBarStyle: {
                backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
                borderTopColor: isDark ? '#262626' : '#e5e5e5',
                height: 50 + insets.bottom,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
            },
            headerShown: false,
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }: { color: string }) => <Home size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="apps"
                options={{
                    title: 'Apps',
                    tabBarIcon: ({ color }: { color: string }) => <Smartphone size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="habits"
                options={{
                    title: 'Habits',
                    tabBarIcon: ({ color }: { color: string }) => <Dumbbell size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="reading"
                options={{
                    title: 'Reading',
                    tabBarIcon: ({ color }: { color: string }) => <BookOpen size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="work"
                options={{
                    title: 'Work',
                    tabBarIcon: ({ color }: { color: string }) => <BarChart2 size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }: { color: string }) => <Settings size={22} color={color} />,
                }}
            />
        </Tabs>
    );
}
