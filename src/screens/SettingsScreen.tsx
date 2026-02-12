import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useSettingsStore } from '@/store/settingsStore';
import { formatTime } from '@/utils/formatters';
import { RotateCcw } from 'lucide-react';

export default function SettingsScreen() {
  const {
    dailyScreenTimeLimit,
    setDailyLimit,
    cooldownDuration,
    setCooldownDuration,
    maxExtensions,
    setMaxExtensions,
    exerciseDifficulty,
    setExerciseDifficulty,
    monitoringEnabled,
    toggleMonitoring,
    notificationsEnabled,
    toggleNotifications,
    resetSettings,
  } = useSettingsStore();

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground tracking-tight">Settings</h1>

      {/* Screen Time Limit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Daily Limit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Limit</span>
            <span className="text-sm font-bold font-mono neon-text-cyan">{formatTime(dailyScreenTimeLimit)}</span>
          </div>
          <Slider
            value={[dailyScreenTimeLimit]}
            onValueChange={([v]) => setDailyLimit(v)}
            min={1800}
            max={21600}
            step={900}
          />
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground font-mono">30m</span>
            <span className="text-[10px] text-muted-foreground font-mono">6h</span>
          </div>
        </CardContent>
      </Card>

      {/* Cooldown & Extensions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Cooldown & Extensions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">Cooldown</span>
              <span className="text-sm font-mono font-medium text-foreground">{formatTime(cooldownDuration)}</span>
            </div>
            <Slider
              value={[cooldownDuration]}
              onValueChange={([v]) => setCooldownDuration(v)}
              min={300}
              max={3600}
              step={300}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">Max Extensions/Day</span>
              <span className="text-sm font-mono font-medium text-foreground">{maxExtensions}</span>
            </div>
            <Slider
              value={[maxExtensions]}
              onValueChange={([v]) => setMaxExtensions(v)}
              min={0}
              max={10}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exercise Difficulty */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Exercise Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <Button
                key={d}
                variant={exerciseDifficulty === d ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExerciseDifficulty(d)}
                className="capitalize text-xs"
              >
                {d}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card>
        <CardContent className="divide-y pt-0">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-foreground">Monitoring</p>
              <p className="text-xs text-muted-foreground">Track app usage</p>
            </div>
            <Switch checked={monitoringEnabled} onCheckedChange={toggleMonitoring} />
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">Limit alerts</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={toggleNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40 hover:bg-destructive/5" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4" />
            Reset All Settings
          </Button>
          <p className="text-[10px] text-center text-muted-foreground font-mono uppercase tracking-wider">v1.0.0</p>
        </CardContent>
      </Card>
    </div>
  );
}
