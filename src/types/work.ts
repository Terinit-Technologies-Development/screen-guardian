export type PerceivedEffect = 'positive' | 'neutral' | 'negative';

export interface WorkSession {
    id: string;
    title: string;
    description?: string;
    category?: string;
    startTime: number; // timestamp
    endTime?: number; // timestamp
    durationSeconds?: number;
    perceivedEffect?: PerceivedEffect;
    createdAt: number; // timestamp
}
