export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  repetitions?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'cardio' | 'strength' | 'flexibility';
  instructions: string[];
  caloriesBurned: number;
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  exerciseName: string;
  completedAt: number; // timestamp
  durationSeconds: number;
  context: 'limit_exceeded' | 'extension_requested';
}

export interface ExerciseStats {
  totalCompleted: number;
  totalDuration: number; // seconds
  totalCalories: number;
  favoriteExercise?: string;
  completionRate: number;
}
