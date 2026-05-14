export type HabitType = 'build' | 'quit';
export type HabitFrequency = 'daily' | 'weekly';
export type HabitLogStatus = 'completed' | 'skipped' | 'failed';

export interface Habit {
    id: string;
    title: string;
    description?: string;
    type: HabitType;
    frequency: HabitFrequency;
    icon: string; // Lucide icon name
    color: string; // Hex color code
    isScreenTimeLinked: boolean;
    createdAt: number; // timestamp
}

export interface HabitLog {
    id: string;
    habitId: string;
    logDate: string; // YYYY-MM-DD format
    status: HabitLogStatus;
    notes?: string;
    loggedAt: number; // timestamp
}
