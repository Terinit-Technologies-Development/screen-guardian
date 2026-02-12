import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useUsageStore } from '../../src/store/usageStore';
import { useExerciseStore } from '../../src/store/exerciseStore';
import { DailySummary } from '../../src/types/usage';
import { formatTime } from '../../src/utils/formatters';
import { TrendingDown, TrendingUp, Target, Dumbbell } from 'lucide-react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function ProgressScreen() {
    const { weeklyData, isLoading, loadWeeklyData } = useUsageStore();
    const { stats } = useExerciseStore();

    useEffect(() => {
        loadWeeklyData();
    }, []);

    const averageTime = weeklyData.length > 0
        ? Math.floor(weeklyData.reduce((sum: number, d: DailySummary) => sum + d.totalScreenTime, 0) / weeklyData.length)
        : 0;

    const daysUnderLimit = weeklyData.filter((d: DailySummary) => !d.limitExceeded).length;

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="p-4 space-y-4">
                <StyledText className="text-2xl font-bold text-foreground mb-4">Progress</StyledText>

                {/* Simplified Chart Area */}
                <StyledView className="bg-card border border-border rounded-xl p-4 h-48 justify-center items-center">
                    <StyledText className="text-muted-foreground text-xs uppercase tracking-widest">
                        Chart Visualization
                    </StyledText>
                    <StyledText className="text-lg font-bold text-foreground mt-2">
                        Weekly Usage: {formatTime(averageTime * 7)}
                    </StyledText>
                </StyledView>

                {/* Stats Grid */}
                <StyledView className="flex-row flex-wrap gap-3">
                    <StyledView className="w-[48%] bg-card border border-border p-4 rounded-xl items-center">
                        <TrendingDown size={16} color="#06b6d4" className="mb-2" />
                        <StyledText className="text-lg font-bold text-foreground">{formatTime(averageTime)}</StyledText>
                        <StyledText className="text-[10px] text-muted-foreground uppercase tracking-wider">Daily Avg</StyledText>
                    </StyledView>

                    <StyledView className="w-[48%] bg-card border border-border p-4 rounded-xl items-center">
                        <Target size={16} color="#22c55e" className="mb-2" />
                        <StyledText className="text-lg font-bold text-foreground">{daysUnderLimit}/{weeklyData.length}</StyledText>
                        <StyledText className="text-[10px] text-muted-foreground uppercase tracking-wider">Under Limit</StyledText>
                    </StyledView>

                    <StyledView className="w-[48%] bg-card border border-border p-4 rounded-xl items-center">
                        <Dumbbell size={16} color="#a855f7" className="mb-2" />
                        <StyledText className="text-lg font-bold text-foreground">{stats.totalCompleted}</StyledText>
                        <StyledText className="text-[10px] text-muted-foreground uppercase tracking-wider">Exercises</StyledText>
                    </StyledView>

                    <StyledView className="w-[48%] bg-card border border-border p-4 rounded-xl items-center">
                        <TrendingUp size={16} color="#ec4899" className="mb-2" />
                        <StyledText className="text-lg font-bold text-foreground">{formatTime(stats.totalDuration)}</StyledText>
                        <StyledText className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Time</StyledText>
                    </StyledView>
                </StyledView>

                {/* Insights */}
                <StyledView className="bg-card border border-cyan-500/20 p-4 rounded-xl bg-cyan-500/5">
                    <StyledText className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Insights</StyledText>
                    <StyledText className="text-sm text-muted-foreground leading-5">
                        {averageTime > 7200
                            ? "You're averaging above your 2-hour daily goal. Consider setting stricter limits on your most-used apps."
                            : "Great job staying under your daily limit. Keep building those healthy digital habits."}
                    </StyledText>
                </StyledView>
            </ScrollView>
        </SafeAreaView>
    );
}
