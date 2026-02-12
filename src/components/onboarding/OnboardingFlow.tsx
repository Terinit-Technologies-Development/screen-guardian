import { useEffect, useState } from 'react';
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

  const handleComplete = () => {
    completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-md"
      >
        {step === 'welcome' && (
          <div className="text-center space-y-6">
            <div className="text-7xl mb-4">⏱️</div>
            <h1 className="text-3xl font-bold text-foreground">Screen Time Monitor</h1>
            <p className="text-muted-foreground text-lg">
              Take control of your digital habits. Track usage, set limits, and earn screen time through exercise.
            </p>
            <Button size="lg" className="w-full text-lg h-14" onClick={next}>
              Get Started
            </Button>
            <div className="flex justify-center gap-2 pt-4">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${s === step ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
        )}

        {step === 'permissions' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-foreground">Permissions</h2>
              <p className="text-muted-foreground mt-2">We need a few permissions to monitor your screen time</p>
            </div>

            <div className="space-y-4 bg-card rounded-xl p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Usage Access</p>
                  <p className="text-sm text-muted-foreground">Track app usage data</p>
                </div>
                <Switch checked={usageAccess} onCheckedChange={setUsageAccess} />
              </div>
              <div className="border-t" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Notifications</p>
                  <p className="text-sm text-muted-foreground">Get limit reminders</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={back}>Back</Button>
              <Button className="flex-1" onClick={next}>Continue</Button>
            </div>

            <div className="flex justify-center gap-2">
              {steps.map((s) => (
                <div key={s} className={`w-2 h-2 rounded-full ${s === step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        )}

        {step === 'limits' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-foreground">Set Your Limits</h2>
              <p className="text-muted-foreground mt-2">Configure your daily screen time goal</p>
            </div>

            <div className="bg-card rounded-xl p-6 border space-y-6">
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Daily Limit</span>
                  <span className="text-sm font-bold text-primary">{formatTime(dailyScreenTimeLimit)}</span>
                </div>
                <Slider
                  value={[dailyScreenTimeLimit]}
                  onValueChange={([v]) => setDailyLimit(v)}
                  min={1800}
                  max={21600}
                  step={900}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">30m</span>
                  <span className="text-xs text-muted-foreground">6h</span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-foreground block mb-3">Exercise Difficulty</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <Button
                      key={d}
                      variant={exerciseDifficulty === d ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExerciseDifficulty(d)}
                      className="capitalize"
                    >
                      {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'} {d}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={back}>Back</Button>
              <Button className="flex-1" onClick={next}>Continue</Button>
            </div>

            <div className="flex justify-center gap-2">
              {steps.map((s) => (
                <div key={s} className={`w-2 h-2 rounded-full ${s === step ? 'bg-primary' : 'bg-muted'}`} />
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
              className="text-7xl"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">You're All Set!</h2>
            <p className="text-muted-foreground">Your screen time monitor is ready to go.</p>

            <div className="bg-card rounded-xl p-4 border text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Daily Limit</span>
                <span className="text-sm font-medium text-foreground">{formatTime(dailyScreenTimeLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Exercise Difficulty</span>
                <span className="text-sm font-medium text-foreground capitalize">{exerciseDifficulty}</span>
              </div>
            </div>

            <Button size="lg" className="w-full text-lg h-14" onClick={handleComplete}>
              Start Monitoring
            </Button>

            <div className="flex justify-center gap-2">
              {steps.map((s) => (
                <div key={s} className={`w-2 h-2 rounded-full ${s === step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
