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
        'flex items-center gap-3 w-full p-3 rounded-lg transition-all',
        'hover:bg-accent/50 text-left group'
      )}
    >
      <span className="text-xl flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-md bg-accent border border-border">
        {app.appIcon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-medium text-sm text-foreground truncate">{app.appName}</span>
          <span className="text-xs font-mono text-muted-foreground ml-2 flex-shrink-0">
            {formatTime(app.timeInForeground)}
          </span>
        </div>
        <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-neon-cyan transition-all duration-500"
            style={{ width: `${percentage}%`, boxShadow: '0 0 6px hsl(var(--neon-cyan) / 0.4)' }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{app.category}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{app.launchCount} opens</span>
        </div>
      </div>
    </button>
  );
}
