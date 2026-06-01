import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseSession, ExerciseStats } from '../types/exercise';
import { supabase } from '../lib/supabase';

interface ExerciseState {
  completedSessions: ExerciseSession[];
  stats: ExerciseStats;

  addSession: (session: ExerciseSession) => void;
  getRecentSessions: (count?: number) => ExerciseSession[];
  loadFromCloud: () => Promise<void>;
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      completedSessions: [],
      stats: {
        totalCompleted: 0,
        totalDuration: 0,
        totalCalories: 0,
        completionRate: 100,
      },

      addSession: async (session) => {
        set(state => {
          const sessions = [session, ...state.completedSessions];
          return {
            completedSessions: sessions,
            stats: {
              totalCompleted: sessions.length,
              totalDuration: sessions.reduce((sum, s) => sum + s.durationSeconds, 0),
              totalCalories: state.stats.totalCalories + 10,
              completionRate: 100,
              favoriteExercise: sessions[0]?.exerciseName,
            },
          };
        });

        try {
          const { data: { session: authSession } } = await supabase.auth.getSession();
          if (authSession?.user) {
            await supabase.from('exercise_sessions').insert({
              id: session.id,
              user_id: authSession.user.id,
              exercise_id: session.exerciseId,
              exercise_name: session.exerciseName,
              duration_seconds: session.durationSeconds,
              completed_at: new Date(session.completedAt).toISOString(),
              context: session.context,
            });
          }
        } catch (e) {
          console.error('Failed to sync exercise session to cloud:', e);
        }
      },

      getRecentSessions: (count = 10) => {
        return get().completedSessions.slice(0, count);
      },

      loadFromCloud: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;

          const { data, error } = await supabase
            .from('exercise_sessions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('completed_at', { ascending: false })
            .limit(50);

          if (!error && data) {
            const mapped: ExerciseSession[] = data.map(s => ({
              id: s.id,
              exerciseId: s.exercise_id || '',
              exerciseName: s.exercise_name,
              completedAt: new Date(s.completed_at).getTime(),
              durationSeconds: s.duration_seconds,
              context: s.context,
            }));
            set({
              completedSessions: mapped,
              stats: {
                totalCompleted: mapped.length,
                totalDuration: mapped.reduce((sum, s) => sum + s.durationSeconds, 0),
                totalCalories: 0,
                completionRate: 100,
                favoriteExercise: mapped[0]?.exerciseName,
              },
            });
          }
        } catch (e) {
          console.error('Failed to load exercise sessions from cloud:', e);
        }
      },
    }),
    {
      name: 'screen-time-exercises',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
