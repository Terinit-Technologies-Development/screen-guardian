import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useSettingsStore } from '@/store/settingsStore';
import { formatTime } from '@/utils/formatters';

const steps = ['welcome', 'permissions', 'limits', 'complete'] as const;
type Step = typeof steps[number];

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>('welcome');
  const {
    dailyScreenTimeLimit,
    setDailyLimit,
    exerciseDifficulty,
    setExerciseDifficulty,
    completeOnboarding,
  } = useSettingsStore();

  const [usageAccess, setUsageAccess] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const next = () => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };

  const back = () => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {step === 'welcome' && (
          <div className="text-center space-y-8">
            <div className="relative inline-block">
              <div className="text-6xl">⏱️</div>
              <div className="absolute -inset-4 bg-neon-cyan/5 rounded-full blur-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Screen Time</h1>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mt-1">Monitor</p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Take control of your digital habits. Track usage, set limits, and earn screen time through exercise.
            </p>
            <Button size="lg" className="w-full h-12 text-sm uppercase tracking-wider font-medium" onClick={next}>
              Get Started
            </Button>
            <div className="flex justify-center gap-2 pt-2">
              {steps.map((s) => (
                <div
                  key={s}
                  className={cn(
                    'w-6 h-1 rounded-full transition-all',
                    s === step ? 'bg-neon-cyan neon-glow-cyan' : 'bg-border'
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {step === 'permissions' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Permissions</h2>
              <p className="text-sm text-muted-foreground mt-2">Enable access to monitor your screen time</p>
            </div>

            <div className="space-y-0 bg-card rounded-xl border divide-y">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Usage Access</p>
                  <p className="text-xs text-muted-foreground">Track app usage data</p>
                </div>
                <Switch checked={usageAccess} onCheckedChange={setUsageAccess} />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Notifications</p>
                  <p className="text-xs text-muted-foreground">Get limit reminders</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11" onClick={back}>Back</Button>
              <Button className="flex-1 h-11" onClick={next}>Continue</Button>
            </div>
            <div className="flex justify-center gap-2">
              {steps.map((s) => (
                <div key={s} className={`w-6 h-1 rounded-full transition-all ${s === step ? 'bg-neon-cyan' : 'bg-border'}`} />
              ))}
            </div>
          </div>
        )}

        {step === 'limits' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Set Your Limits</h2>
              <p className="text-sm text-muted-foreground mt-2">Configure your daily screen time goal</p>
            </div>

            <div className="bg-card rounded-xl border p-6 space-y-6">
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily Limit</span>
                  <span className="text-sm font-bold font-mono neon-text-cyan">{formatTime(dailyScreenTimeLimit)}</span>
                </div>
                <Slider
                  value={[dailyScreenTimeLimit]}
                  onValueChange={([v]) => setDailyLimit(v)}
                  min={1800}
                  max={21600}
                  step={900}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground font-mono">30m</span>
                  <span className="text-[10px] text-muted-foreground font-mono">6h</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-3">Exercise Difficulty</span>
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
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11" onClick={back}>Back</Button>
              <Button className="flex-1 h-11" onClick={next}>Continue</Button>
            </div>
            <div className="flex justify-center gap-2">
              {steps.map((s) => (
                <div key={s} className={`w-6 h-1 rounded-full transition-all ${s === step ? 'bg-neon-cyan' : 'bg-border'}`} />
              ))}
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="text-6xl"
            >
              ✓
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">All Set</h2>
            <p className="text-sm text-muted-foreground">Your screen time monitor is ready.</p>

            <div className="bg-card rounded-xl border divide-y text-left">
              <div className="flex justify-between p-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Daily Limit</span>
                <span className="text-sm font-mono font-medium text-foreground">{formatTime(dailyScreenTimeLimit)}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Difficulty</span>
                <span className="text-sm font-medium text-foreground capitalize">{exerciseDifficulty}</span>
              </div>
            </div>

            <Button size="lg" className="w-full h-12 text-sm uppercase tracking-wider" onClick={completeOnboarding}>
              Start Monitoring
            </Button>
            <div className="flex justify-center gap-2">
              {steps.map((s) => (
                <div key={s} className={`w-6 h-1 rounded-full transition-all ${s === step ? 'bg-neon-cyan' : 'bg-border'}`} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
