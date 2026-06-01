export type HabitType = 'build' | 'quit';
export type HabitFrequency = 'daily' | 'weekly';
export type HabitLogStatus = 'completed' | 'skipped' | 'failed';
export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export const ALL_DAYS: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface Habit {
    id: string;
    title: string;
    description?: string;
    type: HabitType;
    frequency: HabitFrequency;
    routineDays?: DayOfWeek[]; // which days this habit is scheduled for (weekly habits)
    icon: string;
    color: string;
    isScreenTimeLinked: boolean;
    createdAt: number;
}

export interface HabitLog {
    id: string;
    habitId: string;
    logDate: string; // YYYY-MM-DD format
    status: HabitLogStatus;
    notes?: string;
    loggedAt: number;
}
