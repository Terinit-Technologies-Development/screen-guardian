import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/charts/ProgressRing';
import AppUsageItem from '@/components/dashboard/AppUsageItem';
import { useUsageStore } from '@/store/usageStore';
import { formatTime } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Smartphone, Eye } from 'lucide-react';

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
  const maxAppTime = todayApps.length > 0 ? todayApps[0].timeInForeground : 1;

  if (isLoading && todayApps.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      {/* Hero Card */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center py-8">
          <ProgressRing
            progress={progress}
            size={180}
            strokeWidth={14}
            label="remaining"
            value={formatTime(timeRemaining)}
          />

          <div className="grid grid-cols-2 gap-6 mt-6 w-full">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatTime(totalScreenTime)}</p>
              <p className="text-xs text-muted-foreground">Used Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatTime(dailyLimit)}</p>
              <p className="text-xs text-muted-foreground">Daily Limit</p>
            </div>
          </div>

          {isLimitExceeded && (
            <div className="mt-4 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
              ⚠️ Daily limit exceeded!
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            className="mt-4 gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{todayApps.length}</p>
              <p className="text-xs text-muted-foreground">Apps Used</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Eye className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {todayApps.reduce((sum, app) => sum + app.launchCount, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Opens</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Used Apps */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Most Used Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {todayApps.slice(0, 5).map((app) => (
            <AppUsageItem key={app.packageName} app={app} maxTime={maxAppTime} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
