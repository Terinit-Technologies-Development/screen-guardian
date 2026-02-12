import { useLocation, Link } from 'react-router-dom';
import { Home, LayoutGrid, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/apps', label: 'Apps', icon: LayoutGrid },
  { path: '/progress', label: 'Progress', icon: TrendingUp },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wider transition-all',
                isActive
                  ? 'text-neon-cyan'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_hsl(var(--neon-cyan)/0.5)]')} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
