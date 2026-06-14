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
  stateEffects?: Record<string, Partial<WellbeingEffects>>;
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

type AppEffectInput = Pick<AppClassification, 'category' | 'isGame' | 'isMessaging' | 'isDoomscrollRisk' | 'heightenedRestriction'>;

function strengthenNegative(value: number, shouldStrengthen: boolean) {
  if (!shouldStrengthen || value >= 0) return value;
  return Number((value * 1.25).toFixed(2));
}

export function calculateAppStateEffects(app: AppEffectInput | undefined, state: WellbeingState | undefined): Partial<WellbeingEffects> {
  if (!state) return {};
  if (!app) return { screenTime: state.effects.screenTime };

  if (app.isGame || app.category === 'game') {
    return { gaming: strengthenNegative(state.effects.gaming, app.heightenedRestriction) };
  }

  if (app.isMessaging || app.category === 'messaging') {
    return { social: strengthenNegative(Number((state.effects.social * 0.25).toFixed(2)), app.heightenedRestriction) };
  }

  if (app.isDoomscrollRisk || app.category === 'social') {
    return { social: strengthenNegative(state.effects.social, app.heightenedRestriction || app.isDoomscrollRisk) };
  }

  if (app.category === 'productive') {
    return { habits: Number((state.effects.habits * 0.6).toFixed(2)) };
  }

  if (app.category === 'reading') {
    return { reading: state.effects.reading };
  }

  return { screenTime: strengthenNegative(state.effects.screenTime, app.heightenedRestriction) };
}

export function calculateAppStateScoreWeight(app: AppEffectInput | undefined, state: WellbeingState | undefined) {
  const effects = calculateAppStateEffects(app, state);
  return Object.values(effects).reduce((sum, value) => sum + (value ?? 0), 0);
}

export function isAppClassificationComplete(app: AppClassification | undefined) {
  return !!app && !!app.updatedAt;
}
