import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useUsageStore } from '../../src/store/usageStore';
import { AppCategory, AppUsageData } from '../../src/types/usage';
import { APP_CATEGORIES } from '../../src/utils/constants';
import { Smartphone } from 'lucide-react-native';
import { styled } from 'nativewind';
import { formatTime } from '../../src/utils/formatters';

const StyledView = styled(View);
const StyledText = styled(Text);

const allFilter = 'All' as const;
type Filter = typeof allFilter | AppCategory;

export default function AppsScreen() {
    const { todayApps, isLoading, loadTodayUsage } = useUsageStore();
    const [activeFilter, setActiveFilter] = useState<Filter>('All');

    useEffect(() => {
        if (todayApps.length === 0) loadTodayUsage();
    }, []);

    const filteredApps = activeFilter === 'All'
        ? todayApps
        : todayApps.filter((app: AppUsageData) => app.category === activeFilter);

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="p-4">
                <StyledText className="text-2xl font-bold text-foreground mb-4">Apps</StyledText>

                {/* Category Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-4">
                    <TouchableOpacity
                        onPress={() => setActiveFilter('All')}
                        className={`px-4 py-2 rounded-full border ${activeFilter === 'All' ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                    >
                        <StyledText className={`text-xs ${activeFilter === 'All' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                            All
                        </StyledText>
                    </TouchableOpacity>
                    {APP_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveFilter(cat as Filter)}
                            className={`px-4 py-2 rounded-full border ${activeFilter === cat ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                        >
                            <StyledText className={`text-xs ${activeFilter === cat ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                {cat}
                            </StyledText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView className="space-y-4">
                    <StyledView className="bg-card border border-border rounded-xl p-4">
                        <StyledView className="flex-row items-center justify-between mb-4">
                            <StyledText className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
                                {activeFilter === 'All' ? 'All Apps' : activeFilter}
                            </StyledText>
                            <StyledView className="bg-muted px-2 py-1 rounded-md">
                                <StyledText className="text-[10px] text-muted-foreground">{filteredApps.length}</StyledText>
                            </StyledView>
                        </StyledView>

                        {filteredApps.length === 0 ? (
                            <StyledView className="py-12 items-center">
                                <StyledText className="text-4xl mb-2 opacity-20">---</StyledText>
                                <StyledText className="text-xs uppercase tracking-wider text-muted-foreground">No apps in this category</StyledText>
                            </StyledView>
                        ) : (
                            <StyledView className="space-y-4">
                                {filteredApps.map((app: AppUsageData) => (
                                    <StyledView key={app.packageName} className="flex-row items-center justify-between">
                                        <StyledView className="flex-row items-center gap-3">
                                            <StyledView className="w-10 h-10 bg-muted rounded-lg items-center justify-center">
                                                <Smartphone size={20} color="#666" />
                                            </StyledView>
                                            <StyledView>
                                                <StyledText className="text-sm font-medium text-foreground">{app.appName}</StyledText>
                                                <StyledText className="text-xs text-muted-foreground">{formatTime(app.timeInForeground)}</StyledText>
                                            </StyledView>
                                        </StyledView>
                                    </StyledView>
                                ))}
                            </StyledView>
                        )}
                    </StyledView>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
