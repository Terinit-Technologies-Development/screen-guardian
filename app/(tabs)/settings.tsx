import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, AppState, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/store/settingsStore';
import { formatTime } from '../../src/utils/formatters';
import {
    RotateCcw,
    Moon,
    Sun,
    Monitor,
    Bell,
    Shield,
    Activity,
    ChevronRight,
    CircleHelp,
    Info,
    Smartphone,
    User,
    Cloud,
    Save
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useColorScheme } from 'nativewind';

export default function SettingsScreen() {
    const { colorScheme } = useColorScheme();
    const {
        displayName,
        setDisplayName,
        cloudSyncEnabled,
        toggleCloudSync,
        dailyScreenTimeLimit,
        setDailyLimit,
        exerciseDifficulty,
        setExerciseDifficulty,
        monitoringEnabled,
        toggleMonitoring,
        notificationsEnabled,
        toggleNotifications,
        theme,
        setTheme,
        resetSettings,
    } = useSettingsStore();

    const [tempName, setTempName] = React.useState(displayName);

    const handleSaveName = () => {
        setDisplayName(tempName);
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.delay(100).duration(500)} className="px-6 pt-6 pb-2">
                    <Text className="text-3xl font-black text-foreground tracking-tighter">Settings</Text>
                    <Text className="text-muted-foreground text-sm mt-1">Configure your focus sanctuary</Text>
                </Animated.View>

                {/* Profile Section */}
                <Section title="Profile">
                    <View className="bg-card border border-border rounded-3xl p-5 mb-3 shadow-sm">
                        <Text className="text-sm font-bold text-foreground mb-3">Display Name</Text>
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-cyan-500/20 items-center justify-center mr-3">
                                <User size={20} color="#06b6d4" />
                            </View>
                            <TextInput
                                value={tempName}
                                onChangeText={setTempName}
                                placeholder="Enter your name"
                                placeholderTextColor="#94a3b8"
                                className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground font-semibold"
                            />
                            {tempName !== displayName && (
                                <TouchableOpacity onPress={handleSaveName} className="ml-2 bg-cyan-500 p-3 rounded-xl">
                                    <Save size={18} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </Section>

                {/* Cloud Sync */}
                <Section title="Data & Sync">
                    <SettingItem
                        icon={Cloud}
                        title="Cloud Sync"
                        subtitle="Backup habits and sessions to Supabase"
                        right={<Switch value={cloudSyncEnabled} onValueChange={toggleCloudSync} trackColor={{ false: "#3f3f46", true: "#06b6d4" }} />}
                    />
                </Section>

                {/* Appearance Section */}
                <Section title="Appearance">
                    <View className="flex-row gap-2 px-1">
                        {[
                            { id: 'light', icon: Sun, label: 'Light' },
                            { id: 'dark', icon: Moon, label: 'Dark' },
                            { id: 'system', icon: Monitor, label: 'System' }
                        ].map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setTheme(item.id as any)}
                                className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl border ${theme === item.id ? 'bg-cyan-500 border-cyan-500' : 'bg-card border-border'}`}
                            >
                                <item.icon size={16} color={theme === item.id ? '#FFFFFF' : '#94a3b8'} />
                                <Text className={`ml-2 text-xs font-bold ${theme === item.id ? 'text-white' : 'text-muted-foreground'}`}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Section>

                {/* Focus Controls */}
                <Section title="Focus Controls">
                    <SettingItem
                        icon={Shield}
                        title="Monitoring"
                        subtitle="Real-time app usage tracking"
                        right={<Switch value={monitoringEnabled} onValueChange={toggleMonitoring} trackColor={{ false: "#3f3f46", true: "#06b6d4" }} />}
                    />
                    <SettingItem
                        icon={Bell}
                        title="Notifications"
                        subtitle="Alerts for focus budget limits"
                        right={<Switch value={notificationsEnabled} onValueChange={toggleNotifications} trackColor={{ false: "#3f3f46", true: "#06b6d4" }} />}
                    />
                </Section>

                {/* Goals */}
                <Section title="Daily Goals">
                    <View className="bg-card border border-border rounded-3xl p-5 mb-4 shadow-sm">
                        <View className="flex-row justify-between items-center mb-5">
                            <View className="flex-row items-center">
                                <Activity size={20} color="#06b6d4" />
                                <Text className="ml-3 text-base font-bold text-foreground">Screen Time Limit</Text>
                            </View>
                            <Text className="text-lg font-black text-cyan-500">{formatTime(dailyScreenTimeLimit)}</Text>
                        </View>
                        <View className="flex-row gap-1.5">
                            {[3600, 7200, 10800, 14400, 18000].map((val) => (
                                <TouchableOpacity
                                    key={val}
                                    onPress={() => setDailyLimit(val)}
                                    className={`flex-1 py-2.5 rounded-xl items-center border ${dailyScreenTimeLimit === val ? 'bg-cyan-500 border-cyan-500' : 'bg-muted/50 border-border'}`}
                                >
                                    <Text className={`text-[10px] font-black ${dailyScreenTimeLimit === val ? 'text-white' : 'text-muted-foreground'}`}>
                                        {val / 3600}H
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Section>

                {/* Mindfulness */}
                <Section title="Mindfulness">
                    <View className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                        <Text className="text-sm font-bold text-foreground mb-4">Intervention Difficulty</Text>
                        <View className="flex-row gap-2">
                            {(['easy', 'medium', 'hard'] as const).map((d) => (
                                <TouchableOpacity
                                    key={d}
                                    onPress={() => setExerciseDifficulty(d)}
                                    className={`flex-1 py-3 rounded-2xl items-center border ${exerciseDifficulty === d ? 'bg-foreground border-foreground' : 'bg-muted/50 border-border'}`}
                                >
                                    <Text className={`capitalize text-xs font-bold ${exerciseDifficulty === d ? 'text-background' : 'text-muted-foreground'}`}>
                                        {d}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text className="text-[10px] text-muted-foreground mt-4 italic">
                            * Harder difficulty requires more repetitions to access blocked apps.
                        </Text>
                    </View>
                </Section>

                {/* Support & Legal */}
                <Section title="About">
                    <TouchableOpacity className="flex-row items-center justify-between p-4 bg-card border border-border rounded-2xl mb-2">
                        <View className="flex-row items-center">
                            <CircleHelp size={20} color="#94a3b8" />
                            <Text className="ml-3 text-sm font-medium text-foreground">Help Center</Text>
                        </View>
                        <ChevronRight size={18} color="#475569" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between p-4 bg-card border border-border rounded-2xl mb-2">
                        <View className="flex-row items-center">
                            <Info size={20} color="#94a3b8" />
                            <Text className="ml-3 text-sm font-medium text-foreground">Privacy Policy</Text>
                        </View>
                        <ChevronRight size={18} color="#475569" />
                    </TouchableOpacity>
                </Section>

                {/* Danger Zone */}
                <View className="px-6 mt-6">
                    <TouchableOpacity
                        onPress={resetSettings}
                        activeOpacity={0.7}
                        className="flex-row items-center justify-center gap-2 p-5 rounded-[24px] border border-destructive/20 bg-destructive/5"
                    >
                        <RotateCcw size={18} className="text-destructive" />
                        <Text className="text-destructive font-black text-sm uppercase tracking-widest">Wipe All Config</Text>
                    </TouchableOpacity>
                </View>

                <Animated.Text
                    entering={FadeInDown.delay(500)}
                    className="text-[10px] text-center text-muted-foreground font-mono uppercase tracking-[4px] mt-12 opacity-50"
                >
                    Guardian v1.2.0
                </Animated.Text>
            </ScrollView>
        </SafeAreaView>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <View className="mt-8 px-6">
            <Text className="text-[10px] font-black uppercase text-muted-foreground tracking-[3px] mb-4 ml-1">{title}</Text>
            {children}
        </View>
    );
}

function SettingItem({ icon: Icon, title, subtitle, right }: { icon: any, title: string, subtitle: string, right: React.ReactNode }) {
    return (
        <View className="flex-row items-center justify-between p-5 bg-card border border-border rounded-3xl mb-3 shadow-sm">
            <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-xl bg-muted/50 items-center justify-center">
                    <Icon size={20} color="#64748b" />
                </View>
                <View className="ml-4 flex-1">
                    <Text className="text-sm font-bold text-foreground">{title}</Text>
                    <Text className="text-[10px] text-muted-foreground font-medium">{subtitle}</Text>
                </View>
            </View>
            <View className="ml-4">
                {right}
            </View>
        </View>
    );
}
