import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useMotivationStore } from '../../src/store/motivationStore';

export default function AddMotivationScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { addMotivation } = useMotivationStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        if (!title.trim()) return;

        addMotivation({
            title: title.trim(),
            description: description.trim(),
        });

        router.back();
    };

    return (
        <ScrollView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'} p-4`}>
            <Stack.Screen options={{ 
                title: 'New Motivation',
                headerStyle: { backgroundColor: isDark ? '#0a0a0a' : '#ffffff' },
                headerTintColor: isDark ? '#ffffff' : '#000000',
            }} />

            <View className="mb-6">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Quote or Goal</Text>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g., Become a 10x Developer"
                    placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                    className={`p-4 rounded-xl text-base ${isDark ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'} border ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}
                />
            </View>

            <View className="mb-6">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Description (Optional)</Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Why is this important to you?"
                    placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                    multiline
                    numberOfLines={4}
                    className={`p-4 rounded-xl text-base ${isDark ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'} border ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}
                    style={{ textAlignVertical: 'top' }}
                />
            </View>

            <TouchableOpacity 
                onPress={handleSave}
                disabled={!title.trim()}
                className={`p-4 rounded-xl mt-4 ${!title.trim() ? (isDark ? 'bg-neutral-800' : 'bg-neutral-200') : 'bg-cyan-500'}`}
            >
                <Text className={`text-center text-lg font-bold ${!title.trim() ? (isDark ? 'text-neutral-500' : 'text-neutral-400') : 'text-white'}`}>Save Motivation</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
