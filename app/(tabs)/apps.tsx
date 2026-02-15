import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useUsageStore } from '../../src/store/usageStore';
import { AppCategory, AppUsageData } from '../../src/types/usage';
import { APP_CATEGORIES } from '../../src/utils/constants';
import { Smartphone, Search } from 'lucide-react-native';
import { formatTime } from '../../src/utils/formatters';
import { TextInput } from 'react-native';
import { AppLimitModal } from '../../src/components/AppLimitModal';

const allFilter = 'All' as const;
type Filter = typeof allFilter | AppCategory;

export default function AppsScreen() {
    const { todayApps, allApps, isLoading, loadTodayUsage, loadAllApps } = useUsageStore();
    const [activeFilter, setActiveFilter] = useState<Filter>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApp, setSelectedApp] = useState<{ packageName: string, appName: string } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        loadTodayUsage();
        loadAllApps();
    }, []);

    // Merge usage data with all apps
    const processedApps = allApps.map(app => {
        const usage = todayApps.find(u => u.packageName === app.packageName);
        return {
            ...app,
            timeInForeground: usage?.timeInForeground || 0,
            category: usage?.category || 'Other'
        };
    }).sort((a, b) => {
        if (a.timeInForeground !== b.timeInForeground) {
            return b.timeInForeground - a.timeInForeground;
        }
        return a.appName.localeCompare(b.appName);
    });

    const filteredApps = processedApps.filter(app => {
        const matchesFilter = activeFilter === 'All' || app.category === activeFilter;
        const matchesSearch = app.appName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="p-4 flex-1">
                <Text className="text-2xl font-bold text-foreground mb-4">Apps</Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-2 mb-4">
                    <Search size={18} color="#6B7280" />
                    <TextInput
                        className="ml-2 flex-1 text-foreground"
                        placeholder="Search installed apps..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Category Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-4">
                    <TouchableOpacity
                        onPress={() => setActiveFilter('All')}
                        className={`px-4 py-2 rounded-full border ${activeFilter === 'All' ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                    >
                        <Text className={`text-xs ${activeFilter === 'All' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {APP_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveFilter(cat as Filter)}
                            className={`px-4 py-2 rounded-full border ${activeFilter === cat ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                        >
                            <Text className={`text-xs ${activeFilter === cat ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView className="space-y-4">
                    <View className="bg-card border border-border rounded-xl p-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
                                {activeFilter === 'All' ? 'All Apps' : activeFilter}
                            </Text>
                            <View className="bg-muted px-2 py-1 rounded-md">
                                <Text className="text-[10px] text-muted-foreground">{filteredApps.length}</Text>
                            </View>
                        </View>

                        {filteredApps.length === 0 ? (
                            <View className="py-12 items-center">
                                <Text className="text-4xl mb-2 opacity-20">🔍</Text>
                                <Text className="text-xs uppercase tracking-wider text-muted-foreground">No apps found</Text>
                            </View>
                        ) : (
                            <View className="space-y-4">
                                {filteredApps.map((app: any) => (
                                    <View key={app.packageName} className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-3 flex-1">
                                            <View className="w-10 h-10 bg-muted rounded-lg items-center justify-center">
                                                <Smartphone size={20} color="#666" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-sm font-medium text-foreground" numberOfLines={1}>{app.appName}</Text>
                                                <View className="flex-row items-center gap-2">
                                                    <Text className="text-[10px] text-muted-foreground bg-muted-foreground/10 px-1.5 py-0.5 rounded">
                                                        {app.packageName}
                                                    </Text>
                                                    {app.timeInForeground > 0 && (
                                                        <Text className="text-[10px] text-primary font-bold">
                                                            {formatTime(app.timeInForeground)}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedApp({
                                                    packageName: app.packageName,
                                                    appName: app.appName
                                                });
                                                setIsModalVisible(true);
                                            }}
                                            className="bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20"
                                        >
                                            <Text className="text-[10px] text-primary font-bold">Manage</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>

                <AppLimitModal
                    isVisible={isModalVisible}
                    app={selectedApp}
                    onClose={() => {
                        setIsModalVisible(false);
                        setSelectedApp(null);
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
