import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ChevronLeft,
    Clock,
    Eye,
    AlertCircle,
    Sparkles,
    TrendingUp,
    Smartphone,
    ArrowRight,
    Lock,
    Plus
} from 'lucide-react-native';
import Animated, {
    FadeInDown,
} from 'react-native-reanimated';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUsageStore } from '../../src/store/usageStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AppDetails() {
    const { packageName } = useLocalSearchParams<{ packageName: string }>();
    const router = useRouter();
    const { perAppLimits, setAppLimit, removeAppLimit, extendLimit } = useSettingsStore();
    const { todayApps } = useUsageStore();

    // Find current app data
    const appInfo = todayApps.find((a: any) => a.packageName === packageName);
    const existingLimit = perAppLimits[packageName as string];

    const [isEnabled, setIsEnabled] = useState(!!existingLimit);
    const [timeLimit, setTimeLimit] = useState(existingLimit?.maxTimeMinutes?.toString() || '60');
    const [visitLimit, setVisitLimit] = useState(existingLimit?.maxVisits?.toString() || '10');

    // Stats
    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const handleExtension = () => {
        try {
            extendLimit(packageName || '', 15);
            Alert.alert("Success", "Added 15 minutes to your daily budget.");
        } catch (error: any) {
            Alert.alert("Extension Failed", error.message);
        }
    };

    const handleSave = () => {
        if (!packageName) return;

        try {
            if (isEnabled) {
                setAppLimit(packageName, {
                    appId: packageName,
                    appName: appInfo?.appName || 'Unknown App',
                    maxTimeMinutes: parseInt(timeLimit) || 60,
                    maxVisits: parseInt(visitLimit) || 10,
                    category: 'Other',
                    isWhitelisted: false,
                    enabled: true
                });
            } else {
                if (existingLimit && existingLimit.enabled) {
                    setAppLimit(packageName, { enabled: false });
                } else {
                    removeAppLimit(packageName);
                }
            }
            router.back();
        } catch (error: any) {
            Alert.alert("Strict Mode Violation", error.message);
            // Reset state to previous valid state
            setIsEnabled(!!existingLimit?.enabled);
            setTimeLimit(existingLimit?.maxTimeMinutes?.toString() || '60');
        }
    };

    return (
        <View className="flex-1 bg-background pt-14">
            {/* Header */}
            <View className="px-6 flex-row items-center justify-between mb-8">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-card border border-border/80 rounded-2xl items-center justify-center shadow-sm"
                >
                    <ChevronLeft size={24} color="#666" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-foreground">App Details</Text>
                <View className="w-12" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
                {/* App Hero Section */}
                <Animated.View
                    entering={FadeInDown.duration(600).springify()}
                    className="items-center mb-10"
                >
                    <View className="w-24 h-24 bg-card border border-border rounded-[32px] items-center justify-center shadow-xl mb-4">
                        <Smartphone size={48} color="#06b6d4" />
                    </View>
                    <Text className="text-2xl font-black text-foreground tracking-tight text-center">
                        {appInfo?.appName || 'Unknown Application'}
                    </Text>
                    <Text className="text-muted-foreground text-sm font-medium">
                        {packageName}
                    </Text>
                </Animated.View>

                {/* Growth/Usage Insights */}
                <View className="flex-row gap-4 mb-10">
                    <Animated.View
                        entering={FadeInDown.delay(100).springify()}
                        className="flex-1 bg-card border border-border p-5 rounded-3xl shadow-sm"
                    >
                        <View className="flex-row items-center gap-2 mb-2">
                            <Clock size={16} color="#06b6d4" />
                            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Usage</Text>
                        </View>
                        <Text className="text-2xl font-bold text-foreground">
                            {formatTime(Math.round((appInfo?.timeInForeground || 0) / 60))}
                        </Text>
                        <Text className="text-[10px] text-muted-foreground mt-1">Today's total screen time</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(200).springify()}
                        className="flex-1 bg-card border border-border p-5 rounded-3xl shadow-sm"
                    >
                        <View className="flex-row items-center gap-2 mb-2">
                            <TrendingUp size={16} color="#a855f7" />
                            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Visits</Text>
                        </View>
                        <Text className="text-2xl font-bold text-foreground">
                            {appInfo?.launchCount || 0}
                        </Text>
                        <Text className="text-[10px] text-muted-foreground mt-1">Times opened today</Text>
                    </Animated.View>
                </View>

                {/* Limits Section */}
                <Animated.View
                    entering={FadeInDown.delay(300).springify()}
                    className="mb-8"
                >
                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <Text className="text-lg font-bold text-foreground">Configuration</Text>
                            <Text className="text-xs text-muted-foreground">Adjust your focus boundaries</Text>
                        </View>
                        <Switch
                            value={isEnabled}
                            onValueChange={setIsEnabled}
                            trackColor={{ false: '#d1d5db', true: '#06b6d4' }}
                            thumbColor="#FFF"
                        />
                    </View>

                    {existingLimit && (
                        <View className="mb-6 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex-row gap-3">
                            <Lock size={20} color="#f97316" />
                            <View className="flex-1">
                                <Text className="text-orange-500 font-bold text-sm mb-1">Strict Mode Active</Text>
                                <Text className="text-orange-900/60 text-xs">
                                    Limit changes are locked for 12 days. Extensions are limited to 3x/day.
                                </Text>
                            </View>
                        </View>
                    )}

                    {isEnabled ? (
                        <View className="gap-8">
                            <View>
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center gap-2">
                                        <View className="w-8 h-8 rounded-lg bg-cyan-500/10 items-center justify-center">
                                            <Clock size={16} color="#06b6d4" />
                                        </View>
                                        <Text className="text-base font-bold text-foreground">Time Budget</Text>
                                    </View>
                                    {existingLimit?.tempExtensionMinutes ? (
                                        <Text className="text-cyan-500 font-bold">
                                            {timeLimit}m <Text className="text-indigo-400 text-xs">(+{existingLimit.tempExtensionMinutes}m ext)</Text>
                                        </Text>
                                    ) : (
                                        <Text className="text-cyan-500 font-bold">{timeLimit}m</Text>
                                    )}
                                </View>
                                <View className="bg-card border border-border p-1 rounded-2xl flex-row items-center shadow-sm">
                                    <TextInput
                                        className="flex-1 text-foreground font-bold text-lg px-4 py-3"
                                        keyboardType="numeric"
                                        value={timeLimit}
                                        onChangeText={setTimeLimit}
                                        placeholder="60"
                                        placeholderTextColor="#999"
                                    />
                                    <View className="bg-muted/40 px-4 py-3 rounded-xl mr-1 border border-border/40">
                                        <Text className="text-muted-foreground font-bold">min/day</Text>
                                    </View>
                                </View>

                                {/* Emergency Extension */}
                                {existingLimit && (
                                    <TouchableOpacity
                                        onPress={handleExtension}
                                        className="mt-3 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex-row items-center justify-center gap-2"
                                    >
                                        <Plus size={16} color="#6366f1" />
                                        <Text className="text-indigo-500 font-bold text-sm">Add 15m (Max 3x/day)</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View>
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center gap-2">
                                        <View className="w-8 h-8 rounded-lg bg-purple-500/10 items-center justify-center">
                                            <Eye size={16} color="#a855f7" />
                                        </View>
                                        <Text className="text-base font-bold text-foreground">Access Limit</Text>
                                    </View>
                                    <Text className="text-purple-500 font-bold">{visitLimit}x</Text>
                                </View>
                                <View className="bg-card border border-border p-1 rounded-2xl flex-row items-center shadow-sm">
                                    <TextInput
                                        className="flex-1 text-foreground font-bold text-lg px-4 py-3"
                                        keyboardType="numeric"
                                        value={visitLimit}
                                        onChangeText={setVisitLimit}
                                        placeholder="10"
                                        placeholderTextColor="#999"
                                    />
                                    <View className="bg-muted/40 px-4 py-3 rounded-xl mr-1 border border-border/40">
                                        <Text className="text-muted-foreground font-bold">visits/day</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Info Box */}
                            <View className="bg-blue-500/5 p-5 rounded-3xl border border-blue-500/10 flex-row gap-4">
                                <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center">
                                    <Sparkles size={20} color="#3b82f6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-blue-900 font-bold text-sm mb-1">How it works</Text>
                                    <Text className="text-blue-800/60 text-xs leading-5 font-medium">
                                        Screen Guardian will monitor this app in the background. Once your budget is depleted, a refusal exercise will activate.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View className="py-12 items-center bg-card rounded-3xl border border-border/60">
                            <AlertCircle size={48} color="#aaa" />
                            <Text className="text-muted-foreground text-center mt-4 font-bold px-10">
                                Global limits are paused for this app. Enable them to take control.
                            </Text>
                        </View>
                    )}
                </Animated.View>

                <View className="h-20" />
            </ScrollView>

            {/* Bottom Actions */}
            <View className="px-6 pb-8 pt-4 bg-background border-t border-border/40">
                <TouchableOpacity
                    onPress={handleSave}
                    activeOpacity={0.8}
                    className="h-16 bg-cyan-500 rounded-3xl items-center justify-center shadow-xl shadow-cyan-500/30 flex-row gap-3"
                >
                    <Text className="text-white font-bold text-lg">Save Changes</Text>
                    <ArrowRight size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
