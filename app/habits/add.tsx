import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Stack, router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useHabitStore } from '../../src/store/habitStore';
import { HabitType, HabitFrequency } from '../../src/types/habits';

export default function AddHabitScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { addHabit } = useHabitStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<HabitType>('build');
    const [frequency, setFrequency] = useState<HabitFrequency>('daily');
    const [isScreenTimeLinked, setIsScreenTimeLinked] = useState(false);

    const handleSave = () => {
        if (!title.trim()) return;

        addHabit({
            title: title.trim(),
            description: description.trim(),
            type,
            frequency,
            icon: type === 'build' ? 'CheckCircle' : 'XCircle',
            color: type === 'build' ? '#10b981' : '#ef4444', // green or red
            isScreenTimeLinked,
        });

        router.back();
    };

    return (
        <ScrollView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'} p-4`}>
            <Stack.Screen options={{ 
                title: 'New Habit',
                headerStyle: { backgroundColor: isDark ? '#0a0a0a' : '#ffffff' },
                headerTintColor: isDark ? '#ffffff' : '#000000',
            }} />

            <View className="mb-6">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Habit Name</Text>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g., Read 10 pages, No sugar"
                    placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                    className={`p-4 rounded-xl text-base ${isDark ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'} border ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}
                />
            </View>

            <View className="mb-6">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Description (Optional)</Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Why are you building this habit?"
                    placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                    multiline
                    numberOfLines={3}
                    className={`p-4 rounded-xl text-base ${isDark ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'} border ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}
                    style={{ textAlignVertical: 'top' }}
                />
            </View>

            <View className="mb-6">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Type</Text>
                <View className="flex-row space-x-4">
                    <TouchableOpacity 
                        onPress={() => setType('build')}
                        className={`flex-1 p-4 rounded-xl border ${type === 'build' ? (isDark ? 'bg-emerald-900/30 border-emerald-500' : 'bg-emerald-50 border-emerald-500') : (isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200')}`}
                    >
                        <Text className={`text-center font-semibold ${type === 'build' ? 'text-emerald-500' : (isDark ? 'text-neutral-400' : 'text-neutral-500')}`}>Build</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setType('quit')}
                        className={`flex-1 p-4 rounded-xl border ${type === 'quit' ? (isDark ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-500') : (isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200')}`}
                    >
                        <Text className={`text-center font-semibold ${type === 'quit' ? 'text-red-500' : (isDark ? 'text-neutral-400' : 'text-neutral-500')}`}>Quit</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className={`p-4 rounded-xl mb-6 flex-row items-center justify-between ${isDark ? 'bg-neutral-900' : 'bg-white'} border ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                <View className="flex-1 pr-4">
                    <Text className={`font-semibold text-base ${isDark ? 'text-white' : 'text-neutral-900'}`}>Link to Screen Time</Text>
                    <Text className={`text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Automatically log as complete if you stay under your daily limit.</Text>
                </View>
                <Switch 
                    value={isScreenTimeLinked}
                    onValueChange={setIsScreenTimeLinked}
                    trackColor={{ false: isDark ? '#404040' : '#e5e5e5', true: '#06b6d4' }}
                />
            </View>

            <TouchableOpacity 
                onPress={handleSave}
                disabled={!title.trim()}
                className={`p-4 rounded-xl mt-4 mb-12 ${!title.trim() ? (isDark ? 'bg-neutral-800' : 'bg-neutral-200') : 'bg-cyan-500'}`}
            >
                <Text className={`text-center text-lg font-bold ${!title.trim() ? (isDark ? 'text-neutral-500' : 'text-neutral-400') : 'text-white'}`}>Save Habit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
