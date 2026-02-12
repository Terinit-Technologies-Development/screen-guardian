import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  value: string;
  className?: string;
}

export default function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 10,
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
    if (progress > 0.9) return 'hsl(var(--neon-pink))';
    if (progress > 0.7) return 'hsl(var(--neon-purple))';
    return 'hsl(var(--neon-cyan))';
  };

  const getGlow = () => {
    if (progress > 0.9) return '0 0 12px hsl(var(--neon-pink) / 0.5)';
    if (progress > 0.7) return '0 0 12px hsl(var(--neon-purple) / 0.5)';
    return '0 0 12px hsl(var(--neon-cyan) / 0.5)';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
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
          style={{ filter: `drop-shadow(${getGlow()})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold font-mono text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}
