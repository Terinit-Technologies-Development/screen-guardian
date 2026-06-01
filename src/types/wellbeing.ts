export type FunctionalCategory = 'game' | 'messaging' | 'social' | 'productive' | 'reading' | 'other';

export interface AppClassification {
  appId: string;
  appName?: string;
  category: FunctionalCategory;
  isGame: boolean;
  isMessaging: boolean;
  isDoomscrollRisk: boolean;
  heightenedRestriction: boolean;
  dailyTargetMinutes?: number;
  updatedAt: number;
}

export interface WellbeingEffects {
  screenTime: number;
  habits: number;
  reading: number;
  gaming: number;
  social: number;
}

export interface WellbeingState {
  id: string;
  label: string;
  isActive: boolean;
  effects: WellbeingEffects;
  createdAt: number;
  updatedAt: number;
}

export interface FunctionalTimeSummary {
  readingSeconds: number;
  gamingSeconds: number;
  messagingSeconds: number;
  socialSeconds: number;
  doomscrollSeconds: number;
  productiveSeconds: number;
  otherSeconds: number;
}
