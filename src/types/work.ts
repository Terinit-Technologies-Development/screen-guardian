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
    workCardId?: string;
    createdAt: number; // timestamp
}

export type WorkCardStatus = 'planned' | 'active' | 'completed' | 'archived';

export interface WorkCard {
    id: string;
    title: string;
    description?: string;
    category?: string;
    estimatedMinutes: number;
    dueAt?: number;
    status: WorkCardStatus;
    actualSeconds: number;
    createdAt: number;
    updatedAt: number;
}
