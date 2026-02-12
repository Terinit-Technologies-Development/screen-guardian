import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScreenTimeBarChart from '@/components/charts/ScreenTimeBarChart';
import { useUsageStore } from '@/store/usageStore';
import { useExerciseStore } from '@/store/exerciseStore';
import { formatTime, formatPercentage } from '@/utils/formatters';
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
      <h1 className="text-2xl font-bold text-foreground">Progress</h1>

      {/* Weekly Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Screen Time This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <ScreenTimeBarChart data={chartData} />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold text-foreground">{formatTime(averageTime)}</p>
            <p className="text-xs text-muted-foreground">Daily Average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold text-foreground">{daysUnderLimit}/{weeklyData.length}</p>
            <p className="text-xs text-muted-foreground">Days Under Limit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="h-5 w-5 mx-auto mb-1 text-warning" />
            <p className="text-xl font-bold text-foreground">{stats.totalCompleted}</p>
            <p className="text-xs text-muted-foreground">Exercises Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-info" />
            <p className="text-xl font-bold text-foreground">{formatTime(stats.totalDuration)}</p>
            <p className="text-xs text-muted-foreground">Exercise Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📊 Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {averageTime > 7200
              ? "You're averaging above your 2-hour daily goal. Consider setting stricter limits on your most-used apps to build healthier habits."
              : "Great job! You're consistently staying under your daily limit. Keep building those healthy digital habits! 🎉"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
