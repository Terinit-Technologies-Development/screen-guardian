import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScreenTimeBarChart from '@/components/charts/ScreenTimeBarChart';
import { useUsageStore } from '@/store/usageStore';
import { useExerciseStore } from '@/store/exerciseStore';
import { formatTime } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown, TrendingUp, Target, Dumbbell } from 'lucide-react';

export default function ProgressScreen() {
  const { weeklyData, isLoading, loadWeeklyData } = useUsageStore();
  const { stats } = useExerciseStore();

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const chartData = weeklyData.map((day) => ({
    label: day.date.substring(5),
    hours: +(day.totalScreenTime / 3600).toFixed(1),
  }));

  const averageTime = weeklyData.length > 0
    ? Math.floor(weeklyData.reduce((sum, d) => sum + d.totalScreenTime, 0) / weeklyData.length)
    : 0;

  const daysUnderLimit = weeklyData.filter(d => !d.limitExceeded).length;

  if (isLoading && weeklyData.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground tracking-tight">Progress</h1>

      {/* Weekly Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Screen Time This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <ScreenTimeBarChart data={chartData} />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-neon-cyan/10">
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-4 w-4 mx-auto mb-2 text-neon-cyan" />
            <p className="text-lg font-bold font-mono text-foreground">{formatTime(averageTime)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Daily Avg</p>
          </CardContent>
        </Card>
        <Card className="border-neon-green/10">
          <CardContent className="p-4 text-center">
            <Target className="h-4 w-4 mx-auto mb-2 text-neon-green" />
            <p className="text-lg font-bold font-mono text-foreground">{daysUnderLimit}/{weeklyData.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Under Limit</p>
          </CardContent>
        </Card>
        <Card className="border-neon-purple/10">
          <CardContent className="p-4 text-center">
            <Dumbbell className="h-4 w-4 mx-auto mb-2 text-neon-purple" />
            <p className="text-lg font-bold font-mono text-foreground">{stats.totalCompleted}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Exercises</p>
          </CardContent>
        </Card>
        <Card className="border-neon-pink/10">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-2 text-neon-pink" />
            <p className="text-lg font-bold font-mono text-foreground">{formatTime(stats.totalDuration)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-br from-neon-cyan/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {averageTime > 7200
              ? "You're averaging above your 2-hour daily goal. Consider setting stricter limits on your most-used apps."
              : "Great job staying under your daily limit. Keep building those healthy digital habits."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
