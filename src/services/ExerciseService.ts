import { Exercise } from '../types/exercise';

class ExerciseService {
  private exercises: Exercise[] = [
    {
      id: 'jumping-jacks-10',
      name: '10 Jumping Jacks',
      description: 'A quick cardio burst to get your blood flowing',
      duration: 30,
      repetitions: 10,
      difficulty: 'easy',
      category: 'cardio',
      instructions: [
        'Stand with feet together, arms at sides',
        'Jump while spreading legs shoulder-width apart',
        'Simultaneously raise arms above head',
        'Jump back to starting position',
        'Repeat 10 times',
      ],
      caloriesBurned: 5,
    },
    {
      id: 'stretches-basic',
      name: 'Basic Stretches',
      description: 'Simple stretching routine for flexibility',
      duration: 45,
      difficulty: 'easy',
      category: 'flexibility',
      instructions: [
        'Stand up and reach for the sky',
        'Touch your toes (or as far as comfortable)',
        'Roll your shoulders forward and backward',
        'Stretch each arm across your chest',
        'Hold each stretch for 10 seconds',
      ],
      caloriesBurned: 3,
    },
    {
      id: 'push-ups-15',
      name: '15 Push-ups',
      description: 'Build upper body strength',
      duration: 60,
      repetitions: 15,
      difficulty: 'medium',
      category: 'strength',
      instructions: [
        'Start in plank position, hands shoulder-width apart',
        'Keep body in straight line from head to heels',
        'Lower chest until nearly touching floor',
        'Push back up to starting position',
        'Repeat 15 times',
      ],
      caloriesBurned: 12,
    },
    {
      id: 'squats-20',
      name: '20 Squats',
      description: 'Strengthen your legs and core',
      duration: 60,
      repetitions: 20,
      difficulty: 'medium',
      category: 'strength',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower body as if sitting in a chair',
        'Keep knees behind toes',
        'Return to standing position',
        'Repeat 20 times',
      ],
      caloriesBurned: 15,
    },
    {
      id: 'burpees-25',
      name: '25 Burpees',
      description: 'Full-body high-intensity exercise',
      duration: 120,
      repetitions: 25,
      difficulty: 'hard',
      category: 'cardio',
      instructions: [
        'Start standing',
        'Drop into squat position, hands on floor',
        'Kick feet back into plank position',
        'Perform a push-up',
        'Jump feet back to squat position',
        'Jump up with arms overhead',
        'Repeat 25 times',
      ],
      caloriesBurned: 30,
    },
  ];

  getAll(): Exercise[] {
    return this.exercises;
  }

  getByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Exercise[] {
    return this.exercises.filter(ex => ex.difficulty === difficulty);
  }

  getRandom(difficulty: 'easy' | 'medium' | 'hard', excludeIds: string[] = []): Exercise {
    const available = this.exercises.filter(
      ex => ex.difficulty === difficulty && !excludeIds.includes(ex.id)
    );
    if (available.length === 0) {
      return this.exercises.filter(ex => !excludeIds.includes(ex.id))[0] || this.exercises[0];
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  getById(id: string): Exercise | undefined {
    return this.exercises.find(ex => ex.id === id);
  }
}

export default new ExerciseService();
