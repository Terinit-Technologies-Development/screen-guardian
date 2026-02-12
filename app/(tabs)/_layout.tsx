import { Tabs } from 'expo-router';
import { Smartphone, Home, BarChart2, Settings } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#06b6d4',
            tabBarStyle: {
                backgroundColor: '#0a0a0a',
                borderTopColor: '#262626',
            },
            headerShown: false,
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="apps"
                options={{
                    title: 'Apps',
                    tabBarIcon: ({ color }) => <Smartphone size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progress',
                    tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
