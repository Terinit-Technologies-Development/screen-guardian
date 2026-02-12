import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ExerciseService from '@/services/ExerciseService';
import { useSettingsStore } from '@/store/settingsStore';
import { useExerciseStore } from '@/store/exerciseStore';
import { useUsageStore } from '@/store/usageStore';
import { Exercise } from '@/types/exercise';
import { formatTimeDetailed } from '@/utils/formatters';

interface ExerciseModalProps {
  open: boolean;
  onClose: () => void;
  context: 'limit_exceeded' | 'extension_requested';
}

export default function ExerciseModal({ open, onClose, context }: ExerciseModalProps) {
  const { exerciseDifficulty } = useSettingsStore();
  const { addSession } = useExerciseStore();
  const { useExtension } = useUsageStore();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [phase, setPhase] = useState<'intro' | 'active' | 'complete'>('intro');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (open) {
      const ex = ExerciseService.getRandom(exerciseDifficulty);
      setExercise(ex);
      setTimeLeft(ex.duration);
      setPhase('intro');
    }
  }, [open, exerciseDifficulty]);

  useEffect(() => {
    if (phase !== 'active' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhase('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleStart = () => {
    setPhase('active');
  };

  const handleComplete = () => {
    if (!exercise) return;
    addSession({
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      completedAt: Date.now(),
      durationSeconds: exercise.duration,
      context,
    });
    useExtension();
    onClose();
  };

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {phase === 'complete' ? '🎉 Exercise Complete!' : '💪 Complete Exercise'}
          </DialogTitle>
        </DialogHeader>

        {phase === 'intro' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl mb-3">
                  {exercise.category === 'cardio' ? '🏃' : exercise.category === 'strength' ? '💪' : '🧘'}
                </p>
                <h3 className="text-lg font-bold text-foreground">{exercise.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Duration: {formatTimeDetailed(exercise.duration)} • {exercise.caloriesBurned} cal
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Instructions:</p>
              <ol className="space-y-1">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary font-medium">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <Button className="w-full" size="lg" onClick={handleStart}>
              Start Exercise
            </Button>
          </div>
        )}

        {phase === 'active' && (
          <div className="text-center space-y-6 py-4">
            <p className="text-lg font-medium text-foreground">{exercise.name}</p>
            <div className="relative inline-flex items-center justify-center">
              <svg width={160} height={160} className="transform -rotate-90">
                <circle cx={80} cy={80} r={70} fill="none" stroke="hsl(var(--muted))" strokeWidth={8} />
                <circle
                  cx={80} cy={80} r={70} fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (timeLeft / exercise.duration)}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-3xl font-bold text-foreground">
                {formatTimeDetailed(timeLeft)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Keep going! You've got this! 💪</p>
          </div>
        )}

        {phase === 'complete' && (
          <div className="text-center space-y-4 py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-6xl"
            >
              🏆
            </motion.div>
            <p className="text-lg font-medium text-foreground">Great work!</p>
            <p className="text-sm text-muted-foreground">
              You've earned 5 extra minutes of screen time.
            </p>
            <Button className="w-full" size="lg" onClick={handleComplete}>
              Claim Reward
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
