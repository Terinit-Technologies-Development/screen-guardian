import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useUsageStore } from '../../src/store/usageStore';
import { formatTime } from '../../src/utils/formatters';
import { RefreshCw, Smartphone, Eye, Zap } from 'lucide-react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

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

    useEffect(() => {
        loadTodayUsage();
    }, []);

    const timeRemaining = Math.max(0, dailyLimit - totalScreenTime);
    const progress = dailyLimit > 0 ? Math.min(1, totalScreenTime / dailyLimit) : 0;

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="p-4 space-y-4">
                {/* Hero Card Equivalent */}
                <StyledView className="bg-card p-6 rounded-2xl border border-border relative overflow-hidden">
                    <StyledView className="items-center py-4">
                        {/* Simple Text representation for now, ProgressRing needs SVG refactor */}
                        <StyledText className="text-4xl font-bold text-foreground">
                            {formatTime(timeRemaining)}
                        </StyledText>
                        <StyledText className="text-muted-foreground uppercase tracking-widest text-xs mt-1">
                            remaining
                        </StyledText>

                        <StyledView className="flex-row justify-around w-full mt-8">
                            <StyledView className="items-center">
                                <StyledText className="text-2xl font-bold text-cyan-500">{formatTime(totalScreenTime)}</StyledText>
                                <StyledText className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Used Today</StyledText>
                            </StyledView>
                            <StyledView className="items-center">
                                <StyledText className="text-2xl font-bold text-foreground">{formatTime(dailyLimit)}</StyledText>
                                <StyledText className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Daily Limit</StyledText>
                            </StyledView>
                        </StyledView>

                        {isLimitExceeded && (
                            <StyledView className="mt-6 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-lg flex-row items-center gap-2">
                                <Zap size={16} color="#ec4899" />
                                <StyledText className="text-pink-500 font-medium text-sm">Daily limit exceeded</StyledText>
                            </StyledView>
                        )}

                        <TouchableOpacity
                            onPress={refreshData}
                            disabled={isLoading}
                            className="mt-6 flex-row items-center gap-2 opacity-70"
                        >
                            <RefreshCw size={16} color="#666" className={isLoading ? 'animate-spin' : ''} />
                            <StyledText className="text-muted-foreground text-sm">Refresh</StyledText>
                        </TouchableOpacity>
                    </StyledView>
                </StyledView>

                {/* Quick Stats */}
                <StyledView className="flex-row gap-3">
                    <StyledView className="flex-1 bg-card border border-border p-4 rounded-xl flex-row items-center gap-3">
                        <StyledView className="p-2 bg-cyan-500/10 rounded-lg">
                            <Smartphone size={20} color="#06b6d4" />
                        </StyledView>
                        <StyledView>
                            <StyledText className="text-xl font-bold text-foreground">{todayApps.length}</StyledText>
                            <StyledText className="text-xs text-muted-foreground uppercase tracking-wider">Apps</StyledText>
                        </StyledView>
                    </StyledView>

                    <StyledView className="flex-1 bg-card border border-border p-4 rounded-xl flex-row items-center gap-3">
                        <StyledView className="p-2 bg-purple-500/10 rounded-lg">
                            <Eye size={20} color="#a855f7" />
                        </StyledView>
                        <StyledView>
                            <StyledText className="text-xl font-bold text-foreground">
                                {todayApps.reduce((sum, app) => sum + app.launchCount, 0)}
                            </StyledText>
                            <StyledText className="text-xs text-muted-foreground uppercase tracking-wider">Opens</StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>

                {/* Most Used Apps List */}
                <StyledView className="bg-card border border-border rounded-xl p-4">
                    <StyledText className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-4">
                        Most Used Today
                    </StyledText>
                    <StyledView className="space-y-4">
                        {todayApps.slice(0, 5).map((app) => (
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
                </StyledView>
            </ScrollView>
        </SafeAreaView>
    );
}
