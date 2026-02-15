import React, { useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useUsageStore } from '../../src/store/usageStore';
import { useExerciseStore } from '../../src/store/exerciseStore';
import { DailySummary } from '../../src/types/usage';
import { formatTime } from '../../src/utils/formatters';
import {
    TrendingDown,
    TrendingUp,
    Target,
    Dumbbell,
    Zap,
    Clock,
    Calendar,
    ChevronRight,
    Sparkles,
    Activity
} from 'lucide-react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    Layout
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProgressScreen() {
    const { weeklyData, isLoading, loadWeeklyData, totalScreenTime } = useUsageStore();
    const { stats } = useExerciseStore();

    useEffect(() => {
        loadWeeklyData();
    }, []);

    const averageTime = weeklyData.length > 0
        ? Math.floor(weeklyData.reduce((sum: number, d: DailySummary) => sum + d.totalScreenTime, 0) / weeklyData.length)
        : 0;

    const daysUnderLimit = weeklyData.filter((d: DailySummary) => !d.limitExceeded).length;
    const focusScore = Math.max(0, 100 - (averageTime / 7200) * 20); // Calculation for focus score

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View
                    entering={FadeInUp.duration(600)}
                    className="px-6 pt-8 pb-4"
                >
                    <Text className="text-muted-foreground text-xs font-bold uppercase tracking-[2px] mb-1">Growth</Text>
                    <Text className="text-3xl font-bold text-foreground tracking-tight">Your Journey</Text>
                </Animated.View>

                {/* Focus Score Hero */}
                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    className="px-4 mb-8"
                >
                    <View className="bg-cyan-500 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />

                        <View className="flex-row justify-between items-start">
                            <View>
                                <Text className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Focus Score</Text>
                                <Text className="text-6xl font-black text-white">{Math.round(focusScore)}</Text>
                            </View>
                            <View className="bg-white/20 p-3 rounded-2xl border border-white/10">
                                <Sparkles size={24} color="#FFF" />
                            </View>
                        </View>

                        <View className="mt-8 flex-row items-center gap-2">
                            <TrendingDown size={16} color="#FFF" />
                            <Text className="text-white font-medium">12% better than last week</Text>
                        </View>

                        <View className="w-full h-1.5 bg-white/20 rounded-full mt-4 overflow-hidden">
                            <View className="h-full bg-white" style={{ width: `${focusScore}%` }} />
                        </View>
                    </View>
                </Animated.View>

                {/* Weekly Activity Chart (Mock/Visual representation) */}
                <Animated.View
                    entering={FadeInDown.delay(300).springify()}
                    className="px-4 mb-10"
                >
                    <View className="bg-card border border-border/80 rounded-[32px] p-6 shadow-sm">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-foreground font-bold text-lg">Weekly Trends</Text>
                                <Text className="text-muted-foreground text-xs">Minutes Spent</Text>
                            </View>
                            <Calendar size={20} color="#666" />
                        </View>

                        <View className="flex-row items-end justify-between h-32 px-2">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                                const height = 30 + Math.random() * 70;
                                return (
                                    <View key={i} className="items-center gap-2">
                                        <View
                                            className={`w-3 rounded-full ${i === 4 ? 'bg-cyan-500' : 'bg-muted'}`}
                                            style={{ height: `${height}%` }}
                                        />
                                        <Text className="text-[10px] font-bold text-muted-foreground">{day}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </Animated.View>

                {/* Core Stats Grid */}
                <View className="flex-row flex-wrap px-4 gap-4 mb-10">
                    <Animated.View
                        entering={FadeInDown.delay(400).springify()}
                        className="flex-1 min-w-[45%] bg-card border border-border/80 p-5 rounded-3xl shadow-sm"
                    >
                        <View className="w-10 h-10 bg-cyan-500/10 rounded-2xl items-center justify-center mb-3">
                            <Clock size={20} color="#06b6d4" />
                        </View>
                        <Text className="text-xl font-bold text-foreground">{formatTime(averageTime)}</Text>
                        <Text className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Daily Average</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(500).springify()}
                        className="flex-1 min-w-[45%] bg-card border border-border/80 p-5 rounded-3xl shadow-sm"
                    >
                        <View className="w-10 h-10 bg-green-500/10 rounded-2xl items-center justify-center mb-3">
                            <Target size={20} color="#22c55e" />
                        </View>
                        <Text className="text-xl font-bold text-foreground">{daysUnderLimit}/7</Text>
                        <Text className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Days under limit</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(600).springify()}
                        className="flex-1 min-w-[45%] bg-card border border-border/80 p-5 rounded-3xl shadow-sm"
                    >
                        <View className="w-10 h-10 bg-purple-500/10 rounded-2xl items-center justify-center mb-3">
                            <Dumbbell size={20} color="#a855f7" />
                        </View>
                        <Text className="text-xl font-bold text-foreground">{stats.totalCompleted}</Text>
                        <Text className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Focus Sprints</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(700).springify()}
                        className="flex-1 min-w-[45%] bg-card border border-border/80 p-5 rounded-3xl shadow-sm"
                    >
                        <View className="w-10 h-10 bg-pink-500/10 rounded-2xl items-center justify-center mb-3">
                            <Activity size={20} color="#ec4899" />
                        </View>
                        <Text className="text-xl font-bold text-foreground">{formatTime(stats.totalDuration)}</Text>
                        <Text className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Active Focus</Text>
                    </Animated.View>
                </View>

                {/* Key Insight Card */}
                <Animated.View
                    entering={FadeInDown.delay(800).springify()}
                    className="px-4"
                >
                    <View className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[32px] flex-row gap-5 items-start">
                        <View className="w-12 h-12 bg-blue-500/10 rounded-2xl items-center justify-center">
                            <Zap size={24} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-blue-900 font-bold text-lg mb-1">Weekly Insight</Text>
                            <Text className="text-blue-800/60 text-sm leading-6 font-medium">
                                {averageTime > 7200
                                    ? "Your usage is trending high during evenings. Try setting a 'Wind Down' limit for social apps starting at 9 PM."
                                    : "Excellent focus this week! You've stayed consistent with your daily goals. Keep this momentum for a 7-day streak."}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
