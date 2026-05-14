export interface Motivation {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    displayOrder: number;
    createdAt: number; // timestamp
}
