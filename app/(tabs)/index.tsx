import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, AppState, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUsageStore } from '../../src/store/usageStore';
import { usePermissionStore } from '../../src/store/usePermissionStore';
import { PermissionPrompt } from '../../src/components/PermissionPrompt';
import { AppUsageData } from '../../src/types/usage';
import { formatTime } from '../../src/utils/formatters';
import { RefreshCw, Smartphone, Eye, Zap, LayoutGrid, Clock, ChevronRight } from 'lucide-react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    Layout,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
    const {
        totalScreenTime,
        dailyLimit,
        todayApps,
        isLoading,
        loadTodayUsage,
        refreshData,
        isLimitExceeded,
    } = useUsageStore();

    const { checkAllPermissions } = usePermissionStore();

    useEffect(() => {
        const init = async () => {
            await useUsageStore.getState().checkAuthorization();
            await loadTodayUsage();
            checkAllPermissions();
        };

        init();

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                checkAllPermissions();
                refreshData();
            }
        });

        return () => subscription.remove();
    }, []);

    const timeRemaining = Math.max(0, dailyLimit - totalScreenTime);
    const usedPercentage = dailyLimit > 0 ? Math.min(100, (totalScreenTime / dailyLimit) * 100) : 0;

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Context */}
                <Animated.View
                    entering={FadeInUp.delay(100).duration(500)}
                    className="px-6 pt-8 pb-4"
                >
                    <Text className="text-muted-foreground text-xs font-bold uppercase tracking-[2px] mb-1">Overview</Text>
                    <Text className="text-3xl font-bold text-foreground tracking-tight">Focus Dashboard</Text>
                </Animated.View>

                {/* Hero Card */}
                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    className="px-4 mb-8"
                >
                    <View className="bg-[#111112] p-8 rounded-[40px] border border-white/20 shadow-2xl relative overflow-hidden">
                        {/* Background Decorative Element */}
                        <View
                            className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full"
                            style={{ transform: [{ scale: 2 }] }}
                        />

                        <View className="items-center z-10">
                            <View className="mb-2 bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Remaining Today</Text>
                            </View>
                            <Text className="text-5xl font-black text-white tracking-tighter mb-1">
                                {formatTime(timeRemaining)}
                            </Text>

                            {/* Progress Bar */}
                            <View className="w-full h-2 bg-white/5 rounded-full mt-8 overflow-hidden">
                                <Animated.View
                                    className={`h-full ${isLimitExceeded ? 'bg-pink-500' : 'bg-cyan-500'}`}
                                    style={{ width: `${usedPercentage}%` }}
                                />
                            </View>

                            <View className="flex-row justify-between w-full mt-6">
                                <View>
                                    <Text className="text-white/40 text-[10px] font-bold uppercase mb-1">Collected</Text>
                                    <View className="flex-row items-baseline">
                                        <Text className="text-xl font-bold text-cyan-400">{formatTime(totalScreenTime)}</Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="text-white/40 text-[10px] font-bold uppercase mb-1">Daily Budget</Text>
                                    <Text className="text-xl font-bold text-white/80">{formatTime(dailyLimit)}</Text>
                                </View>
                            </View>

                            {isLimitExceeded && (
                                <Animated.View
                                    entering={FadeInUp}
                                    className="mt-8 w-full bg-pink-500/20 border border-pink-500/30 p-4 rounded-2xl flex-row items-center gap-3"
                                >
                                    <View className="w-8 h-8 rounded-full bg-pink-500 items-center justify-center">
                                        <Zap size={16} color="#000" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-pink-500 font-bold text-sm">Target Reached</Text>
                                        <Text className="text-pink-400/60 text-[10px]">Take a break to recharge your focus</Text>
                                    </View>
                                </Animated.View>
                            )}
                        </View>
                    </View>
                </Animated.View>

                {/* Permissions Guidance */}
                <View className="px-4 mb-8">
                    <PermissionPrompt />
                </View>

                {/* Stats Row */}
                <Animated.View
                    entering={FadeInDown.delay(300).springify()}
                    className="flex-row px-4 gap-4 mb-10"
                >
                    <View className="flex-1 bg-card border border-border/80 p-5 rounded-3xl flex-row items-center gap-4 shadow-sm">
                        <View className="w-10 h-10 bg-cyan-500/10 rounded-2xl items-center justify-center">
                            <Smartphone size={20} color="#06b6d4" />
                        </View>
                        <View>
                            <Text className="text-xl font-bold text-foreground">{todayApps.length}</Text>
                            <Text className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Active Apps</Text>
                        </View>
                    </View>

                    <View className="flex-1 bg-card border border-border/80 p-5 rounded-3xl flex-row items-center gap-4 shadow-sm">
                        <View className="w-10 h-10 bg-purple-500/10 rounded-2xl items-center justify-center">
                            <Eye size={20} color="#a855f7" />
                        </View>
                        <View>
                            <Text className="text-xl font-bold text-foreground">
                                {todayApps.reduce((sum, app) => sum + (app.launchCount || 0), 0)}
                            </Text>
                            <Text className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Total Opens</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Most Used Apps */}
                <Animated.View
                    entering={FadeInDown.delay(400).springify()}
                    className="px-4"
                >
                    <View className="flex-row items-center justify-between mb-4 px-2">
                        <Text className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground">Most Used Today</Text>
                        <TouchableOpacity className="flex-row items-center gap-1">
                            <Text className="text-xs font-bold text-cyan-500">View All</Text>
                            <ChevronRight size={14} color="#06b6d4" />
                        </TouchableOpacity>
                    </View>

                    <View className="gap-4">
                        {todayApps.length === 0 ? (
                            <View className="py-12 bg-card border border-dashed border-border rounded-3xl items-center justify-center">
                                <LayoutGrid size={32} color="#666" strokeWidth={1.5} />
                                <Text className="mt-4 text-xs font-bold text-muted-foreground uppercase opacity-40">Awaiting usage data</Text>
                            </View>
                        ) : (
                            todayApps.slice(0, 5).map((app: AppUsageData, index) => {
                                const appProgress = totalScreenTime > 0 ? (app.timeInForeground / totalScreenTime) : 0;
                                return (
                                    <TouchableOpacity
                                        key={app.packageName}
                                        activeOpacity={0.7}
                                        className="bg-card border border-border/80 p-4 rounded-3xl flex-row items-center gap-4 shadow-sm"
                                    >
                                        <View className="w-14 h-14 bg-muted/40 rounded-2xl items-center justify-center border border-border/40">
                                            <Smartphone size={22} color="#666" />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row justify-between items-center mb-1.5">
                                                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>{app.appName}</Text>
                                                <Text className="text-xs font-bold text-cyan-500">{formatTime(app.timeInForeground)}</Text>
                                            </View>
                                            <View className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <Animated.View
                                                    className="h-full bg-cyan-500/60"
                                                    style={{ width: `${Math.max(2, appProgress * 100)}%` }}
                                                />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </Animated.View>

                {/* Footer Sync */}
                <TouchableOpacity
                    onPress={refreshData}
                    disabled={isLoading}
                    className="self-center mt-12 py-3 px-6 bg-white/5 border border-white/5 rounded-full flex-row items-center gap-3 active:opacity-60"
                >
                    <RefreshCw size={14} color="#666" className={isLoading ? 'animate-spin' : ''} />
                    <Text className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                        {isLoading ? 'Syncing...' : 'Sync Data'}
                    </Text>
                </TouchableOpacity>

                {/* Extra Space for Bottom Tab */}
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
