import { Progress } from '@/components/ui/progress';
import { formatTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { AppUsageData } from '@/types/usage';

interface AppUsageItemProps {
  app: AppUsageData;
  maxTime: number;
  onClick?: () => void;
}

export default function AppUsageItem({ app, maxTime, onClick }: AppUsageItemProps) {
  const percentage = Math.min((app.timeInForeground / maxTime) * 100, 100);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full p-3 rounded-lg transition-colors',
        'hover:bg-muted/50 text-left'
      )}
    >
      <span className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-muted">
        {app.appIcon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm text-foreground truncate">{app.appName}</span>
          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
            {formatTime(app.timeInForeground)}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">{app.category}</span>
          <span className="text-xs text-muted-foreground">{app.launchCount} opens</span>
        </div>
      </div>
    </button>
  );
}
