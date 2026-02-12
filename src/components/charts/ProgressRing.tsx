import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  label: string;
  value: string;
  className?: string;
}

export default function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 14,
  label,
  value,
  className,
}: ProgressRingProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);

  const getColor = () => {
    if (progress > 0.9) return 'hsl(var(--destructive))';
    if (progress > 0.7) return 'hsl(var(--warning))';
    return 'hsl(var(--primary))';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
