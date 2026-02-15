import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, AppState } from 'react-native';
import React, { useEffect } from 'react';
import { useUsageStore } from '../../src/store/usageStore';
import { usePermissionStore } from '../../src/store/usePermissionStore';
import { PermissionPrompt } from '../../src/components/PermissionPrompt';
import { AppUsageData } from '../../src/types/usage';
import { formatTime } from '../../src/utils/formatters';
import { RefreshCw, Smartphone, Eye, Zap } from 'lucide-react-native';

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

        // Check permissions again when app comes to foreground
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                checkAllPermissions();
                refreshData();
            }
        });

        return () => subscription.remove();
    }, []);

    const timeRemaining = Math.max(0, dailyLimit - totalScreenTime);
    const progress = dailyLimit > 0 ? Math.min(1, totalScreenTime / dailyLimit) : 0;

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingVertical: 24, gap: 24 }}
            >
                {/* Permissions Guidance */}
                <PermissionPrompt />

                {/* Hero Card Equivalent */}
                <View className="bg-card p-6 rounded-2xl border border-border relative overflow-hidden">
                    <View className="items-center py-4">
                        {/* Simple Text representation for now, ProgressRing needs SVG refactor */}
                        <Text className="text-4xl font-bold text-foreground">
                            {formatTime(timeRemaining)}
                        </Text>
                        <Text className="text-muted-foreground uppercase tracking-widest text-xs mt-1">
                            remaining
                        </Text>

                        <View className="flex-row justify-around w-full mt-8">
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-cyan-500">{formatTime(totalScreenTime)}</Text>
                                <Text className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Used Today</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-foreground">{formatTime(dailyLimit)}</Text>
                                <Text className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Daily Limit</Text>
                            </View>
                        </View>

                        {isLimitExceeded && (
                            <View className="mt-6 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-lg flex-row items-center gap-2">
                                <Zap size={16} color="#ec4899" />
                                <Text className="text-pink-500 font-medium text-sm">Daily limit exceeded</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={refreshData}
                            disabled={isLoading}
                            className="mt-6 flex-row items-center gap-2 opacity-70"
                        >
                            <RefreshCw size={16} color="#666" className={isLoading ? 'animate-spin' : ''} />
                            <Text className="text-muted-foreground text-sm">Refresh</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats */}
                <View className="flex-row gap-4">
                    <View className="flex-1 bg-card border border-border p-4 rounded-xl flex-row items-center gap-3">
                        <View className="p-2 bg-cyan-500/10 rounded-lg">
                            <Smartphone size={20} color="#06b6d4" />
                        </View>
                        <View>
                            <Text className="text-xl font-bold text-foreground">{todayApps.length}</Text>
                            <Text className="text-xs text-muted-foreground uppercase tracking-wider">Apps</Text>
                        </View>
                    </View>

                    <View className="flex-1 bg-card border border-border p-4 rounded-xl flex-row items-center gap-3">
                        <View className="p-2 bg-purple-500/10 rounded-lg">
                            <Eye size={20} color="#a855f7" />
                        </View>
                        <View>
                            <Text className="text-xl font-bold text-foreground">
                                {todayApps.reduce((sum, app) => sum + (app.launchCount || 0), 0)}
                            </Text>
                            <Text className="text-xs text-muted-foreground uppercase tracking-wider">Opens</Text>
                        </View>
                    </View>
                </View>

                {/* Most Used Apps List */}
                <View className="bg-card border border-border rounded-xl p-4">
                    <Text className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-4">
                        Most Used Today
                    </Text>
                    <View className="space-y-5">
                        {todayApps.length === 0 ? (
                            <View className="py-8 items-center justify-center">
                                <Text className="text-muted-foreground text-xs uppercase tracking-widest">No usage data today</Text>
                            </View>
                        ) : (
                            todayApps.slice(0, 5).map((app: AppUsageData) => {
                                const appProgress = totalScreenTime > 0 ? (app.timeInForeground / totalScreenTime) : 0;
                                return (
                                    <View key={app.packageName} className="flex-row items-center gap-4">
                                        <View className="w-12 h-12 bg-muted/50 rounded-2xl items-center justify-center border border-border/50">
                                            <Smartphone size={22} color="#666" />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row justify-between items-center mb-1.5">
                                                <Text className="text-sm font-semibold text-foreground">{app.appName}</Text>
                                                <Text className="text-xs font-bold text-cyan-500">{formatTime(app.timeInForeground)}</Text>
                                            </View>
                                            {/* Mini Usage Bar */}
                                            <View className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <View
                                                    className="h-full bg-cyan-500"
                                                    style={{ width: `${appProgress * 100}%` }}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
