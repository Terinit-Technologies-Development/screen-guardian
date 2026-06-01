import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Modal, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitStore } from '../store/habitStore';
import { HabitType, HabitFrequency, HabitMetricType, DayOfWeek, ALL_DAYS } from '../types/habits';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export function AddHabitModal({ visible, onClose }: Props) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const { addHabit } = useHabitStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<HabitType>('build');
    const [frequency, setFrequency] = useState<HabitFrequency>('daily');
    const [metricType, setMetricType] = useState<HabitMetricType>('completion');
    const [targetValue, setTargetValue] = useState('10');
    const [intendedTimeMinutes, setIntendedTimeMinutes] = useState('15');
    const [routineDays, setRoutineDays] = useState<DayOfWeek[]>([]);
    const [isScreenTimeLinked, setIsScreenTimeLinked] = useState(false);

    const toggleDay = (day: DayOfWeek) => {
        setRoutineDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSave = () => {
        if (!title.trim()) return;
        if (frequency === 'weekly' && routineDays.length === 0) return;

        addHabit({
            title: title.trim(),
            description: description.trim(),
            type,
            frequency,
            routineDays: frequency === 'weekly' ? routineDays : undefined,
            metricType,
            targetValue: metricType === 'completion' ? undefined : Math.max(1, parseInt(targetValue, 10) || 1),
            intendedTimeMinutes: Math.max(0, parseInt(intendedTimeMinutes, 10) || 0) || undefined,
            icon: type === 'build' ? 'CheckCircle' : 'XCircle',
            color: type === 'build' ? '#10b981' : '#ef4444',
            isScreenTimeLinked,
        });

        resetForm();
        onClose();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setType('build');
        setFrequency('daily');
        setMetricType('completion');
        setTargetValue('10');
        setIntendedTimeMinutes('15');
        setRoutineDays([]);
        setIsScreenTimeLinked(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const bg = isDark ? 'bg-neutral-950' : 'bg-white';
    const muted = isDark ? 'text-neutral-400' : 'text-neutral-500';
    const label = isDark ? 'text-neutral-300' : 'text-neutral-700';
    const inputBg = isDark ? 'bg-neutral-900' : 'bg-neutral-50';
    const inputBorder = isDark ? 'border-neutral-800' : 'border-neutral-200';
    const textColor = isDark ? 'text-white' : 'text-neutral-900';

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/60 justify-end">
                <Pressable className="flex-1" onPress={handleClose} />
                <View className={`${bg} rounded-t-[32px] max-h-[85%]`}>
                    <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                        <Text className={`text-xl font-black ${textColor}`}>New Habit</Text>
                        <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
                            <X size={20} color={isDark ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        className="px-6 pt-4"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 40) }}
                    >
                        <View className="mb-5">
                            <Text className={`text-sm font-bold mb-2 ${label}`}>Habit Name</Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="e.g., Read 10 pages, No sugar"
                                placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                                className={`p-4 rounded-xl text-base ${inputBg} ${textColor} border ${inputBorder}`}
                            />
                        </View>

                        <View className="mb-5">
                            <Text className={`text-sm font-bold mb-2 ${label}`}>Description (optional)</Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Why this matters..."
                                placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                                multiline
                                numberOfLines={2}
                                className={`p-4 rounded-xl text-base ${inputBg} ${textColor} border ${inputBorder}`}
                                style={{ textAlignVertical: 'top' }}
                            />
                        </View>

                        <View className="mb-5">
                            <Text className={`text-sm font-bold mb-2 ${label}`}>Type</Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setType('build')}
                                    className={`flex-1 p-4 rounded-xl border ${type === 'build'
                                        ? (isDark ? 'bg-emerald-900/30 border-emerald-500' : 'bg-emerald-50 border-emerald-500')
                                        : `${inputBg} ${inputBorder}`
                                    }`}
                                >
                                    <Text className={`text-center font-bold ${type === 'build' ? 'text-emerald-500' : muted}`}>
                                        Build
                                    </Text>
                                    <Text className={`text-[10px] text-center mt-1 ${type === 'build' ? 'text-emerald-500/70' : muted}`}>
                                        Positive to grow
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setType('quit');
                                        setMetricType('completion');
                                    }}
                                    className={`flex-1 p-4 rounded-xl border ${type === 'quit'
                                        ? (isDark ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-500')
                                        : `${inputBg} ${inputBorder}`
                                    }`}
                                >
                                    <Text className={`text-center font-bold ${type === 'quit' ? 'text-red-500' : muted}`}>
                                        Quit
                                    </Text>
                                    <Text className={`text-[10px] text-center mt-1 ${type === 'quit' ? 'text-red-500/70' : muted}`}>
                                        Negative to drop
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="mb-5">
                            <Text className={`text-sm font-bold mb-2 ${label}`}>Frequency</Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setFrequency('daily')}
                                    className={`flex-1 p-4 rounded-xl border ${frequency === 'daily'
                                        ? (isDark ? 'bg-cyan-900/30 border-cyan-500' : 'bg-cyan-50 border-cyan-500')
                                        : `${inputBg} ${inputBorder}`
                                    }`}
                                >
                                    <Text className={`text-center font-bold ${frequency === 'daily' ? 'text-cyan-500' : muted}`}>Daily</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setFrequency('weekly')}
                                    className={`flex-1 p-4 rounded-xl border ${frequency === 'weekly'
                                        ? (isDark ? 'bg-purple-900/30 border-purple-500' : 'bg-purple-50 border-purple-500')
                                        : `${inputBg} ${inputBorder}`
                                    }`}
                                >
                                    <Text className={`text-center font-bold ${frequency === 'weekly' ? 'text-purple-500' : muted}`}>Weekly</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {frequency === 'weekly' && (
                            <View className="mb-5">
                                <Text className={`text-sm font-bold mb-2 ${label}`}>Scheduled Days</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {ALL_DAYS.map(day => (
                                        <TouchableOpacity
                                            key={day}
                                            onPress={() => toggleDay(day)}
                                            className={`w-[45px] h-[45px] rounded-xl items-center justify-center border ${routineDays.includes(day)
                                                ? 'bg-purple-500 border-purple-500'
                                                : `${inputBg} ${inputBorder}`
                                            }`}
                                        >
                                            <Text className={`text-xs font-bold ${routineDays.includes(day) ? 'text-white' : muted}`}>
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {routineDays.length === 0 && (
                                    <Text className="text-[10px] text-red-500 mt-2 font-medium">Select at least one day</Text>
                                )}
                            </View>
                        )}

                        {type === 'build' && (
                            <View className="mb-5">
                                <Text className={`text-sm font-bold mb-2 ${label}`}>Tracking</Text>
                                <View className="gap-2">
                                    {([
                                        ['completion', 'Simple completion', 'Tap complete manually'],
                                        ['pages_read', 'Reading pages', 'Auto-complete from in-app books'],
                                        ['reading_minutes', 'Reading minutes', 'Counts active time inside reader'],
                                    ] as [HabitMetricType, string, string][]).map(([id, titleText, subtitle]) => (
                                        <TouchableOpacity
                                            key={id}
                                            onPress={() => setMetricType(id)}
                                            className={`p-4 rounded-xl border ${metricType === id
                                                ? 'bg-cyan-500/10 border-cyan-500'
                                                : `${inputBg} ${inputBorder}`
                                            }`}
                                        >
                                            <Text className={`font-bold ${metricType === id ? 'text-cyan-500' : textColor}`}>
                                                {titleText}
                                            </Text>
                                            <Text className={`text-xs mt-0.5 ${muted}`}>{subtitle}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {metricType !== 'completion' && (
                                    <View className="mt-3">
                                        <Text className={`text-xs font-bold mb-2 ${label}`}>
                                            Target {metricType === 'pages_read' ? 'pages' : 'minutes'} per scheduled day
                                        </Text>
                                        <TextInput
                                            value={targetValue}
                                            onChangeText={setTargetValue}
                                            keyboardType="number-pad"
                                            placeholder="10"
                                            placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                                            className={`p-4 rounded-xl text-base ${inputBg} ${textColor} border ${inputBorder}`}
                                        />
                                    </View>
                                )}
                            </View>
                        )}

                        <View className="mb-5">
                            <Text className={`text-sm font-bold mb-2 ${label}`}>Intended Time</Text>
                            <TextInput
                                value={intendedTimeMinutes}
                                onChangeText={setIntendedTimeMinutes}
                                keyboardType="number-pad"
                                placeholder="15"
                                placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                                className={`p-4 rounded-xl text-base ${inputBg} ${textColor} border ${inputBorder}`}
                            />
                            <Text className={`text-xs mt-2 ${muted}`}>Minutes you intend to spend. Completing with more time is positive; less time is flagged for attention.</Text>
                        </View>

                        <View className={`p-4 rounded-xl mb-6 flex-row items-center justify-between ${inputBg} border ${inputBorder}`}>
                            <View className="flex-1 pr-4">
                                <Text className={`font-bold text-base ${textColor}`}>Link to Screen Time</Text>
                                <Text className={`text-xs mt-0.5 ${muted}`}>Auto-complete if you stay under your daily limit</Text>
                            </View>
                            <Switch
                                value={isScreenTimeLinked}
                                onValueChange={setIsScreenTimeLinked}
                                trackColor={{ false: isDark ? '#404040' : '#e5e5e5', true: '#06b6d4' }}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={!title.trim() || (frequency === 'weekly' && routineDays.length === 0)}
                            className={`p-4 rounded-2xl ${(!title.trim() || (frequency === 'weekly' && routineDays.length === 0))
                                ? (isDark ? 'bg-neutral-800' : 'bg-neutral-200')
                                : 'bg-cyan-500'
                            }`}
                        >
                            <Text className={`text-center text-lg font-black ${(!title.trim() || (frequency === 'weekly' && routineDays.length === 0))
                                ? (isDark ? 'text-neutral-500' : 'text-neutral-400')
                                : 'text-white'
                            }`}>Create Habit</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
