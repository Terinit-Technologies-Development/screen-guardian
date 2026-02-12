import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppUsageItem from '@/components/dashboard/AppUsageItem';
import { useUsageStore } from '@/store/usageStore';
import { AppCategory } from '@/types/usage';
import { APP_CATEGORIES } from '@/utils/constants';

const allFilter = 'All' as const;
type Filter = typeof allFilter | AppCategory;

export default function AppsScreen() {
  const { todayApps, isLoading, loadTodayUsage } = useUsageStore();
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  useEffect(() => {
    if (todayApps.length === 0) loadTodayUsage();
  }, []);

  const filteredApps = activeFilter === 'All'
    ? todayApps
    : todayApps.filter(app => app.category === activeFilter);

  const maxTime = todayApps.length > 0 ? todayApps[0].timeInForeground : 1;

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground tracking-tight">Apps</h1>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Button
          size="sm"
          variant={activeFilter === 'All' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('All')}
          className="flex-shrink-0 text-xs h-8"
        >
          All
        </Button>
        {APP_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={activeFilter === cat ? 'default' : 'outline'}
            onClick={() => setActiveFilter(cat as Filter)}
            className="flex-shrink-0 text-xs h-8"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* App List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {activeFilter === 'All' ? 'All Apps' : activeFilter}
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-[10px]">{filteredApps.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApps.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-2xl mb-2">—</p>
              <p className="text-xs uppercase tracking-wider">No apps in this category</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredApps.map((app) => (
                <AppUsageItem key={app.packageName} app={app} maxTime={maxTime} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
