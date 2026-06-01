import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useHabitStore } from '../../src/store/habitStore';
import { AddHabitModal } from '../../src/components/AddHabitModal';
import { Plus, Check, X, Flame } from 'lucide-react-native';
import { format } from 'date-fns';
import { Habit, HabitLogStatus } from '../../src/types/habits';

export default function HabitsScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { habits, logs, logHabit, getHabitStreak } = useHabitStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [actualMinutes, setActualMinutes] = useState<Record<string, number>>({});

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const renderHabitItem = (habit: Habit) => {
        const logKey = `${habit.id}_${todayStr}`;
        const todayLog = logs[logKey];
        const status = todayLog?.status;
        const streak = getHabitStreak(habit.id);

        const isBuild = habit.type === 'build';
        const isReadingMetric = habit.metricType === 'pages_read' || habit.metricType === 'reading_minutes';
        const target = habit.targetValue ?? 1;
        const progress = todayLog?.progressValue ?? 0;
        const intendedMinutes = habit.intendedTimeMinutes ?? 0;
        const selectedActualMinutes = actualMinutes[habit.id] ?? intendedMinutes;
        const loggedActualMinutes = Math.round((todayLog?.durationSeconds ?? 0) / 60);

        const updateActualMinutes = (delta: number) => {
            setActualMinutes(prev => ({
                ...prev,
                [habit.id]: Math.max(0, (prev[habit.id] ?? intendedMinutes) + delta),
            }));
        };

        return (
            <View
                key={habit.id}
                className={`flex-row items-center p-4 mb-3 rounded-2xl border ${
                    isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
                }`}
            >
                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                            {habit.title}
                        </Text>
                        {habit.routineDays && habit.routineDays.length > 0 && (
                            <Text className={`text-[10px] font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                {habit.routineDays.join('·')}
                            </Text>
                        )}
                    </View>
                    <View className="flex-row items-center mt-1 gap-3">
                        <View className="flex-row items-center gap-1">
                            <Flame
                                size={14}
                                color={streak > 0 ? '#f97316' : isDark ? '#525252' : '#a3a3a3'}
                            />
                            <Text
                                className={`text-xs font-bold ${
                                    streak > 0
                                        ? 'text-orange-500'
                                        : isDark
                                        ? 'text-neutral-500'
                                        : 'text-neutral-400'
                                }`}
                            >
                                {streak}d
                            </Text>
                        </View>
                        <View
                            className={`px-2 py-0.5 rounded-full ${
                                isBuild
                                    ? isDark
                                        ? 'bg-emerald-900/30'
                                        : 'bg-emerald-50'
                                    : isDark
                                    ? 'bg-red-900/30'
                                    : 'bg-red-50'
                            }`}
                        >
                            <Text
                                className={`text-[10px] font-bold uppercase ${
                                    isBuild ? 'text-emerald-500' : 'text-red-500'
                                }`}
                            >
                                {isBuild ? 'Build' : 'Quit'}
                            </Text>
                        </View>
                        {habit.frequency === 'weekly' && (
                            <Text className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                Weekly
                            </Text>
                        )}
                    </View>
                    {isReadingMetric && (
                        <Text className={`text-xs mt-1 font-semibold ${status === 'completed' ? 'text-emerald-500' : isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            {progress}/{target} {habit.metricType === 'pages_read' ? 'pages' : 'minutes'} today
                        </Text>
                    )}
                    {intendedMinutes > 0 && !isReadingMetric && (
                        <View className="flex-row items-center gap-2 mt-2">
                            <TouchableOpacity onPress={() => updateActualMinutes(-5)} className={`px-2 py-1 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                                <Text className={isDark ? 'text-neutral-300' : 'text-neutral-600'}>-5</Text>
                            </TouchableOpacity>
                            <Text className={`text-[11px] font-bold ${status === 'completed'
                                ? loggedActualMinutes >= intendedMinutes ? 'text-emerald-500' : 'text-orange-500'
                                : isDark ? 'text-neutral-400' : 'text-neutral-500'
                            }`}>
                                {status === 'completed' ? loggedActualMinutes : selectedActualMinutes}/{intendedMinutes} min
                            </Text>
                            <TouchableOpacity onPress={() => updateActualMinutes(5)} className={`px-2 py-1 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                                <Text className={isDark ? 'text-neutral-300' : 'text-neutral-600'}>+5</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View className="flex-row gap-1.5">
                    <TouchableOpacity
                        onPress={() => logHabit(habit.id, todayStr, 'skipped')}
                        className={`w-9 h-9 rounded-xl items-center justify-center border ${
                            status === 'skipped'
                                ? isDark
                                    ? 'bg-neutral-800 border-neutral-600'
                                    : 'bg-neutral-200 border-neutral-400'
                                : isDark
                                ? 'bg-neutral-900 border-neutral-800'
                                : 'bg-white border-neutral-200'
                        }`}
                    >
                        <Text
                            className={`font-bold text-sm ${
                                status === 'skipped'
                                    ? isDark
                                        ? 'text-white'
                                        : 'text-neutral-800'
                                    : isDark
                                    ? 'text-neutral-500'
                                    : 'text-neutral-400'
                            }`}
                        >
                            −
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => logHabit(habit.id, todayStr, 'failed')}
                        className={`w-9 h-9 rounded-xl items-center justify-center border ${
                            status === 'failed'
                                ? 'bg-red-500 border-red-500'
                                : isDark
                                ? 'bg-neutral-900 border-neutral-800'
                                : 'bg-white border-neutral-200'
                        }`}
                    >
                        <X
                            size={18}
                            color={status === 'failed' ? '#fff' : isDark ? '#525252' : '#a3a3a3'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => logHabit(
                            habit.id,
                            todayStr,
                            'completed',
                            intendedMinutes > 0
                                ? selectedActualMinutes >= intendedMinutes
                                    ? `Met intended time: ${selectedActualMinutes}/${intendedMinutes} min`
                                    : `Below intended time: ${selectedActualMinutes}/${intendedMinutes} min`
                                : undefined,
                            0,
                            'manual',
                            selectedActualMinutes * 60
                        )}
                        className={`w-9 h-9 rounded-xl items-center justify-center border ${
                            status === 'completed'
                                ? 'bg-emerald-500 border-emerald-500'
                                : isDark
                                ? 'bg-neutral-900 border-neutral-800'
                                : 'bg-white border-neutral-200'
                        }`}
                    >
                        <Check
                            size={18}
                            color={status === 'completed' ? '#fff' : isDark ? '#525252' : '#a3a3a3'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const habitsToBuild = habits.filter(h => h.type === 'build');
    const habitsToQuit = habits.filter(h => h.type === 'quit');

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`} edges={['top']}>
            <View
                className={`px-6 pt-6 pb-4 flex-row justify-between items-center ${
                    isDark ? 'bg-neutral-950' : 'bg-white'
                } border-b ${isDark ? 'border-neutral-900' : 'border-neutral-200'}`}
            >
                <View>
                    <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        Habits
                    </Text>
                    <Text className={`text-sm font-semibold mt-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                        {format(new Date(), 'EEEE, MMMM do')}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowAddModal(true)}
                    className="w-10 h-10 rounded-full bg-cyan-500 items-center justify-center"
                >
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 pt-6">
                {habits.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <View className={`w-16 h-16 rounded-full ${isDark ? 'bg-neutral-900' : 'bg-neutral-100'} items-center justify-center mb-4`}>
                            <Flame size={28} color={isDark ? '#404040' : '#d4d4d4'} />
                        </View>
                        <Text className={`text-lg font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            No habits yet
                        </Text>
                        <Text className={`text-sm text-center mt-2 px-8 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Tap + to start building good habits or quitting bad ones. Each log builds your streak.
                        </Text>
                    </View>
                ) : (
                    <>
                        {habitsToBuild.length > 0 && (
                            <View className="mb-6">
                                <Text
                                    className={`text-xs font-black uppercase tracking-wider mb-3 ml-2 ${
                                        isDark ? 'text-emerald-500' : 'text-emerald-600'
                                    }`}
                                >
                                    Build ({habitsToBuild.length})
                                </Text>
                                {habitsToBuild.map(renderHabitItem)}
                            </View>
                        )}

                        {habitsToQuit.length > 0 && (
                            <View className="mb-8">
                                <Text
                                    className={`text-xs font-black uppercase tracking-wider mb-3 ml-2 ${
                                        isDark ? 'text-red-500' : 'text-red-600'
                                    }`}
                                >
                                    Quit ({habitsToQuit.length})
                                </Text>
                                {habitsToQuit.map(renderHabitItem)}
                            </View>
                        )}

                        <View className="h-4" />
                    </>
                )}
            </ScrollView>

            <AddHabitModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
        </SafeAreaView>
    );
}
