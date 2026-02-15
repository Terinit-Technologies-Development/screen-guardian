import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useUsageStore } from '../../src/store/usageStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { AppCategory } from '../../src/types/usage';
import { APP_CATEGORIES } from '../../src/utils/constants';
import { Smartphone, Search, Filter, Shield, Clock, ChevronRight, Activity } from 'lucide-react-native';
import { formatTime } from '../../src/utils/formatters';
import { AppLimitModal } from '../../src/components/AppLimitModal';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const allFilter = 'All' as const;
type FilterType = typeof allFilter | AppCategory;

export default function AppsScreen() {
    const { todayApps, allApps, isLoading, loadTodayUsage, loadAllApps, totalScreenTime } = useUsageStore();
    const { perAppLimits } = useSettingsStore();
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApp, setSelectedApp] = useState<{ packageName: string, appName: string } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        loadTodayUsage();
        loadAllApps();
    }, []);

    const processedApps = allApps.map(app => {
        const usage = todayApps.find(u => u.packageName === app.packageName);
        const hasLimit = !!perAppLimits[app.packageName];
        return {
            ...app,
            timeInForeground: usage?.timeInForeground || 0,
            category: usage?.category || 'Other',
            hasLimit
        };
    }).sort((a, b) => {
        if (a.hasLimit !== b.hasLimit) return a.hasLimit ? -1 : 1;
        if (a.timeInForeground !== b.timeInForeground) return b.timeInForeground - a.timeInForeground;
        return a.appName.localeCompare(b.appName);
    });

    const filteredApps = processedApps.filter(app => {
        const matchesFilter = activeFilter === 'All' || app.category === activeFilter;
        const matchesSearch = app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.packageName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <View className="flex-1">
                    {/* Header Section */}
                    <View className="px-6 pt-6 pb-2">
                        <View className="flex-row items-center justify-between mb-6">
                            <View>
                                <Text className="text-3xl font-bold text-foreground tracking-tight">Library</Text>
                                <Text className="text-muted-foreground text-sm font-medium">Manage your digital boundaries</Text>
                            </View>
                            <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center border border-primary/20">
                                <Activity size={24} color="#06b6d4" />
                            </View>
                        </View>

                        {/* Search Bar */}
                        <View className="flex-row items-center bg-card border border-border/80 rounded-2xl px-4 py-3 mb-6">
                            <Search size={20} color="#666" />
                            <TextInput
                                className="ml-3 flex-1 text-foreground font-medium"
                                placeholder="Search apps..."
                                placeholderTextColor="#666"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                selectionColor="#06b6d4"
                            />
                        </View>

                        {/* Category Filters */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8, paddingRight: 40 }}
                            className="flex-grow-0 mb-6"
                        >
                            <TouchableOpacity
                                onPress={() => setActiveFilter('All')}
                                className={`px-5 py-2.5 rounded-2xl border ${activeFilter === 'All' ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-card border-border'}`}
                            >
                                <Text className={`text-xs font-bold ${activeFilter === 'All' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                    All
                                </Text>
                            </TouchableOpacity>
                            {APP_CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setActiveFilter(cat as FilterType)}
                                    className={`px-5 py-2.5 rounded-2xl border ${activeFilter === cat ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-card border-border'}`}
                                >
                                    <Text className={`text-xs font-bold ${activeFilter === cat ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* App List */}
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xs uppercase tracking-[2px] text-muted-foreground font-bold">
                                {activeFilter === 'All' ? 'Installed Apps' : activeFilter}
                            </Text>
                            <View className="bg-muted px-2.5 py-1 rounded-lg">
                                <Text className="text-[10px] font-bold text-muted-foreground">{filteredApps.length} Total</Text>
                            </View>
                        </View>

                        {filteredApps.length === 0 ? (
                            <View className="py-20 items-center justify-center opacity-40">
                                <View className="w-20 h-20 bg-muted rounded-full items-center justify-center mb-4">
                                    <Search size={32} color="#666" />
                                </View>
                                <Text className="text-sm font-bold text-muted-foreground">No matches found</Text>
                            </View>
                        ) : (
                            <View className="gap-4">
                                {filteredApps.map((app, index) => {
                                    const appProgress = totalScreenTime > 0 ? (app.timeInForeground / totalScreenTime) : 0;
                                    return (
                                        <Animated.View
                                            key={app.packageName}
                                            entering={FadeInDown.delay(index * 20).duration(300)}
                                            layout={Layout.springify()}
                                        >
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setSelectedApp({
                                                        packageName: app.packageName,
                                                        appName: app.appName
                                                    });
                                                    setIsModalVisible(true);
                                                }}
                                                activeOpacity={0.7}
                                                className={`p-4 rounded-[28px] border ${app.hasLimit ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-card border-border/80 shadow-sm'}`}
                                            >
                                                <View className="flex-row items-center gap-4">
                                                    <View className={`w-14 h-14 rounded-2xl items-center justify-center border ${app.hasLimit ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-muted/40 border-border/40'}`}>
                                                        <Smartphone size={24} color={app.hasLimit ? '#22d3ee' : '#71717a'} />
                                                    </View>
                                                    <View className="flex-1">
                                                        <View className="flex-row justify-between items-start mb-1">
                                                            <View className="flex-1">
                                                                <Text className="text-base font-bold text-foreground pr-2" numberOfLines={1}>
                                                                    {app.appName}
                                                                </Text>
                                                                <Text className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter" numberOfLines={1}>
                                                                    {app.packageName}
                                                                </Text>
                                                            </View>
                                                            {app.hasLimit && (
                                                                <View className="bg-cyan-500/20 px-2 py-0.5 rounded-full">
                                                                    <Shield size={10} color="#22d3ee" />
                                                                </View>
                                                            )}
                                                        </View>

                                                        <View className="flex-row items-center justify-between mt-2">
                                                            <View className="flex-row items-center gap-1.5 flex-1 mr-4">
                                                                <Clock size={12} color={app.timeInForeground > 0 ? "#06b6d4" : "#666"} />
                                                                <Text className={`text-xs font-bold ${app.timeInForeground > 0 ? 'text-primary' : 'text-muted-foreground/60'}`}>
                                                                    {app.timeInForeground > 0 ? formatTime(app.timeInForeground) : 'Idle today'}
                                                                </Text>
                                                            </View>
                                                            <View className="flex-row items-center gap-1">
                                                                <Text className="text-[10px] font-bold text-muted-foreground uppercase">Settings</Text>
                                                                <ChevronRight size={12} color="#666" />
                                                            </View>
                                                        </View>

                                                        {/* Usage Progress Bar */}
                                                        {app.timeInForeground > 0 && (
                                                            <View className="h-1 bg-muted/40 rounded-full mt-3 overflow-hidden">
                                                                <Animated.View
                                                                    className="h-full bg-cyan-500/60"
                                                                    style={{ width: `${Math.max(2, appProgress * 100)}%` }}
                                                                />
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            <AppLimitModal
                isVisible={isModalVisible}
                app={selectedApp}
                onClose={() => {
                    setIsModalVisible(false);
                    setSelectedApp(null);
                }}
            />
        </SafeAreaView>
    );
}
