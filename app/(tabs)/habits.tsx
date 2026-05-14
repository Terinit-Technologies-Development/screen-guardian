import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useHabitStore } from '../../src/store/habitStore';
import { Plus, Check, X, Circle, Flame, Smartphone } from 'lucide-react-native';
import { format } from 'date-fns';
import { Habit, HabitLogStatus } from '../../src/types/habits';
import { useUsageStore } from '../../src/store/usageStore';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function HabitsScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { habits, logs, logHabit, getHabitStreak } = useHabitStore();
    const { totalScreenTime } = useUsageStore();
    const { dailyScreenTimeLimit } = useSettingsStore();

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const renderHabitItem = (habit: Habit) => {
        const logKey = `${habit.id}_${todayStr}`;
        const todayLog = logs[logKey];
        const status = todayLog?.status;
        const streak = getHabitStreak(habit.id);

        return (
            <View key={habit.id} className={`flex-row items-center p-4 mb-3 rounded-xl border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
                <View className="flex-1">
                    <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{habit.title}</Text>
                    <View className="flex-row items-center mt-1">
                        <Flame size={14} color={streak > 0 ? '#f97316' : (isDark ? '#525252' : '#a3a3a3')} />
                        <Text className={`ml-1 text-xs font-semibold ${streak > 0 ? 'text-orange-500' : (isDark ? 'text-neutral-500' : 'text-neutral-400')}`}>
                            {streak} Day Streak
                        </Text>
                        {habit.isScreenTimeLinked && (
                            <View className={`ml-3 px-2 py-0.5 rounded-full flex-row items-center space-x-1 ${
                                totalScreenTime > dailyScreenTimeLimit 
                                    ? (isDark ? 'bg-red-900/30' : 'bg-red-50')
                                    : (isDark ? 'bg-cyan-900/30' : 'bg-cyan-50')
                            }`}>
                                <Smartphone size={10} color={totalScreenTime > dailyScreenTimeLimit ? '#ef4444' : '#06b6d4'} />
                                <Text className={`text-[10px] font-bold uppercase ${
                                    totalScreenTime > dailyScreenTimeLimit ? 'text-red-500' : 'text-cyan-500'
                                }`}>
                                    {Math.round(totalScreenTime / 60)} / {Math.round(dailyScreenTimeLimit / 60)}m
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-2">
                    <TouchableOpacity 
                        onPress={() => logHabit(habit.id, todayStr, 'skipped')}
                        className={`w-10 h-10 rounded-full items-center justify-center border ${status === 'skipped' ? (isDark ? 'bg-neutral-800 border-neutral-600' : 'bg-neutral-200 border-neutral-400') : (isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200')}`}
                    >
                        <Text className={`font-bold ${status === 'skipped' ? (isDark ? 'text-white' : 'text-neutral-800') : (isDark ? 'text-neutral-500' : 'text-neutral-400')}`}>-</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => logHabit(habit.id, todayStr, 'failed')}
                        className={`w-10 h-10 rounded-full items-center justify-center border ${status === 'failed' ? 'bg-red-500 border-red-500' : (isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200')}`}
                    >
                        <X size={20} color={status === 'failed' ? '#fff' : (isDark ? '#525252' : '#a3a3a3')} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => logHabit(habit.id, todayStr, 'completed')}
                        className={`w-10 h-10 rounded-full items-center justify-center border ${status === 'completed' ? 'bg-emerald-500 border-emerald-500' : (isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200')}`}
                    >
                        <Check size={20} color={status === 'completed' ? '#fff' : (isDark ? '#525252' : '#a3a3a3')} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const habitsToBuild = habits.filter(h => h.type === 'build');
    const habitsToQuit = habits.filter(h => h.type === 'quit');

    return (
        <View className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
            <View className={`px-6 pt-14 pb-4 ${isDark ? 'bg-neutral-950' : 'bg-white'} border-b ${isDark ? 'border-neutral-900' : 'border-neutral-200'} flex-row justify-between items-center`}>
                <View>
                    <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Habits</Text>
                    <Text className={`text-sm font-semibold mt-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{format(new Date(), 'EEEE, MMMM do')}</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => router.push('/habits/add')}
                    className="w-10 h-10 rounded-full bg-cyan-500 items-center justify-center"
                >
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 pt-6">
                {habits.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Circle size={48} color={isDark ? '#262626' : '#e5e5e5'} />
                        <Text className={`text-lg font-bold mt-4 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>No Habits Yet</Text>
                        <Text className={`text-sm text-center mt-2 px-8 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Click the + button to start tracking a new habit to build or quit.
                        </Text>
                    </View>
                ) : (
                    <>
                        {habitsToBuild.length > 0 && (
                            <View className="mb-6">
                                <Text className={`text-xs font-bold uppercase tracking-wider mb-3 ml-2 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Build</Text>
                                {habitsToBuild.map(renderHabitItem)}
                            </View>
                        )}

                        {habitsToQuit.length > 0 && (
                            <View className="mb-8">
                                <Text className={`text-xs font-bold uppercase tracking-wider mb-3 ml-2 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Quit</Text>
                                {habitsToQuit.map(renderHabitItem)}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
