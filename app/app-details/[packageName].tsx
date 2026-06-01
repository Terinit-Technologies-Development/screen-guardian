import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    Plus,
    Gamepad2,
    MessageCircle,
    AlertTriangle,
    SlidersHorizontal,
    CheckCircle
} from 'lucide-react-native';
import Animated, {
    FadeInDown,
} from 'react-native-reanimated';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUsageStore } from '../../src/store/usageStore';
import { useWellbeingStore } from '../../src/store/wellbeingStore';
import { calculateAppStateEffects, FunctionalCategory, isAppClassificationComplete } from '../../src/types/wellbeing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AppDetails() {
    const { packageName } = useLocalSearchParams<{ packageName: string }>();
    const router = useRouter();
    const { perAppLimits, setAppLimit, removeAppLimit, extendLimit } = useSettingsStore();
    const { todayApps, allApps } = useUsageStore();
    const { classifications, classifyApp, states } = useWellbeingStore();

    // Find current app data
    const appInfo = todayApps.find((a: any) => a.packageName === packageName) ?? allApps.find((a: any) => a.packageName === packageName);
    const existingLimit = perAppLimits[packageName as string];
    const classification = classifications[packageName as string];
    const activeState = states.find(s => s.isActive) ?? states[0];
    const isConfigured = isAppClassificationComplete(classification);

    const [isEnabled, setIsEnabled] = useState(!!existingLimit);
    const [timeLimit, setTimeLimit] = useState(existingLimit?.maxTimeMinutes?.toString() || '60');
    const [visitLimit, setVisitLimit] = useState(existingLimit?.maxVisits?.toString() || '10');
    const [category, setCategory] = useState<FunctionalCategory>(classification?.category ?? 'other');
    const [isGame, setIsGame] = useState(!!classification?.isGame);
    const [isMessaging, setIsMessaging] = useState(!!classification?.isMessaging);
    const [isDoomscrollRisk, setIsDoomscrollRisk] = useState(!!classification?.isDoomscrollRisk);
    const [heightenedRestriction, setHeightenedRestriction] = useState(!!classification?.heightenedRestriction);
    const [dailyTargetMinutes, setDailyTargetMinutes] = useState(classification?.dailyTargetMinutes?.toString() ?? '30');
    const calculatedEffects = calculateAppStateEffects({ category, isGame, isMessaging, isDoomscrollRisk, heightenedRestriction }, activeState);

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

            classifyApp(packageName, appInfo?.appName || 'Unknown App', {
                category,
                isGame,
                isMessaging,
                isDoomscrollRisk,
                heightenedRestriction,
                dailyTargetMinutes: Math.max(0, parseInt(dailyTargetMinutes, 10) || 0) || undefined,
            });
            router.back();
        } catch (error: any) {
            Alert.alert("Strict Mode Violation", error.message);
            // Reset state to previous valid state
            setIsEnabled(!!existingLimit?.enabled);
            setTimeLimit(existingLimit?.maxTimeMinutes?.toString() || '60');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
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
                    {isConfigured && (
                        <View className="mt-4 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex-row items-center gap-2">
                            <CheckCircle size={14} color="#10b981" />
                            <Text className="text-xs font-black text-emerald-600 uppercase tracking-wider">Configured</Text>
                        </View>
                    )}
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

                {/* Functional Classification */}
                <Animated.View entering={FadeInDown.delay(250).springify()} className="mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-lg font-bold text-foreground">Functional Classification</Text>
                            <Text className="text-xs text-muted-foreground">Classify this app for wellbeing scoring</Text>
                        </View>
                        <SlidersHorizontal size={20} color="#06b6d4" />
                    </View>

                    <View className="bg-card border border-border rounded-3xl p-4 mb-3">
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {([
                                ['other', 'Other'],
                                ['game', 'Game'],
                                ['messaging', 'Messaging'],
                                ['social', 'Social'],
                                ['productive', 'Productive'],
                                ['reading', 'Reading'],
                            ] as [FunctionalCategory, string][]).map(([id, label]) => (
                                <TouchableOpacity key={id} onPress={() => setCategory(id)} className={`px-3 py-2 rounded-xl border ${category === id ? 'bg-cyan-500 border-cyan-500' : 'border-border bg-background'}`}>
                                    <Text className={`text-xs font-black ${category === id ? 'text-white' : 'text-muted-foreground'}`}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <ToggleRow icon={Gamepad2} title="Treat as game / downtime" subtitle="Counts toward healthy gaming time" value={isGame} onChange={(v) => { setIsGame(v); if (v) setCategory('game'); }} />
                        <ToggleRow icon={MessageCircle} title="Messaging app" subtitle="Separates communication from doomscrolling" value={isMessaging} onChange={(v) => { setIsMessaging(v); if (v) setCategory('messaging'); }} />
                        <ToggleRow icon={AlertTriangle} title="Doomscroll risk" subtitle="Flags social apps for heightened restriction" value={isDoomscrollRisk} onChange={(v) => { setIsDoomscrollRisk(v); if (v) { setCategory('social'); setHeightenedRestriction(true); } }} />
                        <ToggleRow icon={Lock} title="Heightened restriction" subtitle="Marks this app as requiring stricter limits" value={heightenedRestriction} onChange={setHeightenedRestriction} />

                        <View className="mt-4">
                            <Text className="text-sm font-bold text-foreground mb-2">Healthy daily target</Text>
                            <View className="bg-background border border-border p-1 rounded-2xl flex-row items-center">
                                <TextInput className="flex-1 text-foreground font-bold text-lg px-4 py-3" keyboardType="numeric" value={dailyTargetMinutes} onChangeText={setDailyTargetMinutes} placeholder="30" placeholderTextColor="#999" />
                                <View className="bg-muted/40 px-4 py-3 rounded-xl mr-1 border border-border/40">
                                    <Text className="text-muted-foreground font-bold">min/day</Text>
                                </View>
                            </View>
                        </View>

                        {activeState && (
                            <View className="mt-5 p-4 rounded-2xl bg-muted/30 border border-border">
                                <Text className="text-sm font-black text-foreground">{activeState.label} calculated effects</Text>
                                <Text className="text-[10px] text-muted-foreground mt-1 mb-3">Derived automatically from this app's category and risk flags.</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {Object.entries(calculatedEffects).map(([key, value]) => (
                                        <View key={key} className="px-3 py-2 rounded-xl bg-background border border-border">
                                            <Text className="text-[10px] font-bold text-muted-foreground uppercase">{key}</Text>
                                            <Text className={`text-sm font-black ${(value ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{(value ?? 0).toFixed(2)}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </Animated.View>

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
        </SafeAreaView>
    );
}

function ToggleRow({ icon: Icon, title, subtitle, value, onChange }: { icon: any; title: string; subtitle: string; value: boolean; onChange: (value: boolean) => void }) {
    return (
        <View className="flex-row items-center justify-between py-3 border-b border-border/50">
            <View className="flex-row items-center flex-1 pr-4">
                <View className="w-9 h-9 rounded-xl bg-muted/50 items-center justify-center mr-3">
                    <Icon size={18} color="#64748b" />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-bold text-foreground">{title}</Text>
                    <Text className="text-[10px] text-muted-foreground">{subtitle}</Text>
                </View>
            </View>
            <Switch value={value} onValueChange={onChange} trackColor={{ false: '#3f3f46', true: '#06b6d4' }} />
        </View>
    );
}
