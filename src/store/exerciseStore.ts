import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseSession, ExerciseStats } from '../types/exercise';

interface ExerciseState {
  completedSessions: ExerciseSession[];
  stats: ExerciseStats;

  addSession: (session: ExerciseSession) => void;
  getRecentSessions: (count?: number) => ExerciseSession[];
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

      addSession: (session) => {
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
      },

      getRecentSessions: (count = 10) => {
        return get().completedSessions.slice(0, count);
      },
    }),
    {
      name: 'screen-time-exercises',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
