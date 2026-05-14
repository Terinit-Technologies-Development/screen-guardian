import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useMotivationStore } from '../../src/store/motivationStore';
import { Plus, Trash2, Quote } from 'lucide-react-native';

export default function MotivationsScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { motivations, removeMotivation } = useMotivationStore();

    return (
        <View className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
            <Stack.Screen options={{ 
                title: 'Motivations',
                headerStyle: { backgroundColor: isDark ? '#0a0a0a' : '#ffffff' },
                headerTintColor: isDark ? '#ffffff' : '#000000',
            }} />

            <ScrollView className="flex-1 px-4 pt-6">
                {motivations.length === 0 ? (
                    <View className="items-center py-20">
                        <Quote size={48} color={isDark ? '#262626' : '#e5e5e5'} />
                        <Text className={`text-lg font-bold mt-4 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>No Motivations Yet</Text>
                        <Text className={`text-sm text-center mt-2 px-8 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Add goals or quotes that inspire you to stay focused and build better habits.
                        </Text>
                    </View>
                ) : (
                    motivations.map(motivation => (
                        <View key={motivation.id} className={`p-5 mb-4 rounded-2xl border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1 pr-4">
                                    <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{motivation.title}</Text>
                                    {motivation.description && (
                                        <Text className={`text-base mt-2 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{motivation.description}</Text>
                                    )}
                                </View>
                                <TouchableOpacity onPress={() => removeMotivation(motivation.id)} className="p-2">
                                    <Trash2 size={20} color={isDark ? '#525252' : '#a3a3a3'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
                <View className="h-20" />
            </ScrollView>

            <View className={`absolute bottom-8 right-6`}>
                <TouchableOpacity 
                    onPress={() => router.push('/motivations/add')}
                    className="w-14 h-14 rounded-full bg-cyan-500 items-center justify-center shadow-lg"
                    style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }}
                >
                    <Plus size={28} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
