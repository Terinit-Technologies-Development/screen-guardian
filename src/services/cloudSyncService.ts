import { supabase } from '../lib/supabase';
import { useHabitStore } from '../store/habitStore';
import { useMotivationStore } from '../store/motivationStore';
import { useWorkStore } from '../store/workStore';
import { useExerciseStore } from '../store/exerciseStore';
import { useFocusStore } from '../store/focusStore';
import { useUsageStore } from '../store/usageStore';
import { useSettingsStore } from '../store/settingsStore';

export async function syncAllFromCloud() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await Promise.allSettled([
    useHabitStore.getState().loadFromCloud(),
    useMotivationStore.getState().loadFromCloud(),
    useWorkStore.getState().loadFromCloud(),
    useExerciseStore.getState().loadFromCloud(),
    useFocusStore.getState().loadFromCloud(),
    useUsageStore.getState().loadFromCloud(),
    useSettingsStore.getState().loadFromCloud(),
  ]);
}
