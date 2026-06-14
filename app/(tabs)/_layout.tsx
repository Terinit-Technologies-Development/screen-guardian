import { Tabs } from 'expo-router';
import { Smartphone, Home, BarChart2, Settings, Dumbbell, BookOpen, HeartPulse, Trophy, CalendarDays } from 'lucide-react-native';
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
            tabBarShowLabel: false,
            tabBarStyle: {
                position: 'absolute',
                left: 16,
                right: 16,
                bottom: Math.max(10, insets.bottom + 4),
                backgroundColor: isDark ? 'rgba(10, 10, 10, 0.94)' : 'rgba(255, 255, 255, 0.94)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.1)',
                borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.1)',
                borderWidth: 1,
                borderTopWidth: 1,
                height: 62,
                borderRadius: 31,
                paddingTop: 8,
                paddingBottom: 8,
                paddingHorizontal: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 14 },
                shadowOpacity: isDark ? 0.5 : 0.16,
                shadowRadius: 24,
                elevation: 18,
            },
            tabBarItemStyle: {
                height: 46,
                borderRadius: 23,
                marginHorizontal: 1,
            },
            headerShown: false,
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home size={22} color={String(color)} />,
                }}
            />
            <Tabs.Screen
                name="apps"
                options={{
                    title: 'Apps',
                    tabBarIcon: ({ color }) => <Smartphone size={22} color={String(color)} />,
                }}
            />
            <Tabs.Screen
                name="habits"
                options={{
                    title: 'Habits',
                    tabBarIcon: ({ color }) => <Dumbbell size={22} color={String(color)} />,
                }}
            />
            <Tabs.Screen
                name="reading"
                options={{
                    title: 'Reading',
                    tabBarIcon: ({ color }) => <BookOpen size={22} color={String(color)} />,
                }}
            />
            <Tabs.Screen
                name="wellbeing"
                options={{
                    title: 'Wellbeing',
                    tabBarIcon: ({ color }) => <HeartPulse size={22} color={String(color)} />,
                }}
            />
            <Tabs.Screen
                name="achievements"
                options={{
                    title: 'Achievements',
                    tabBarIcon: ({ color }) => <Trophy size={22} color={String(color)} />,
                }}
            />
<Tabs.Screen
                name="work"
                options={{
                    title: 'Work',
                    tabBarIcon: ({ color }) => <BarChart2 size={22} color={String(color)} />,
                }}
            />
            <Tabs.Screen
                name="planner"
                options={{
                    title: 'Planner',
                    tabBarIcon: ({ color }) => <CalendarDays size={22} color={String(color)} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Settings size={22} color={String(color)} />,
                }}
            />
        </Tabs>
    );
}
