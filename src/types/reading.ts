export type ReadingBookStatus = 'reading' | 'completed' | 'archived';

export interface ReadingBook {
    id: string;
    title: string;
    fileName?: string;
    localUri: string;
    totalPages: number;
    currentPage: number;
    status: ReadingBookStatus;
    importedAt: number;
    updatedAt: number;
}

export interface ReadingSession {
    id: string;
    bookId: string;
    startedAt: number;
    endedAt?: number;
    startPage: number;
    endPage: number;
    pagesRead: number;
    durationSeconds: number;
}

export interface ReadingDailyLog {
    date: string;
    pagesRead: number;
    durationSeconds: number;
}
