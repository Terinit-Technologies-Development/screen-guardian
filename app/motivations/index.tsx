import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function MotivationsScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className={`flex-1 items-center justify-center ${isDark ? 'bg-neutral-950' : 'bg-white'}`}>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Motivations</Text>
            <Text className={`text-base mt-2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Motivation tracking coming soon...</Text>
        </View>
    );
}
