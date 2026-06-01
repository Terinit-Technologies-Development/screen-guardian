export type HabitType = 'build' | 'quit';
export type HabitFrequency = 'daily' | 'weekly';
export type HabitLogStatus = 'completed' | 'skipped' | 'failed';
export type HabitMetricType = 'completion' | 'pages_read' | 'reading_minutes';
export type HabitLogSource = 'manual' | 'reading' | 'screen_time';
export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export const ALL_DAYS: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface Habit {
    id: string;
    title: string;
    description?: string;
    type: HabitType;
    frequency: HabitFrequency;
    routineDays?: DayOfWeek[]; // which days this habit is scheduled for (weekly habits)
    metricType?: HabitMetricType;
    targetValue?: number;
    intendedTimeMinutes?: number;
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
    progressValue?: number;
    durationSeconds?: number;
    source?: HabitLogSource;
    notes?: string;
    loggedAt: number;
}
