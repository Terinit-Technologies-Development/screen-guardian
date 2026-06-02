export type PlannerStateId = 'lock-in' | 'deep-work' | 'balanced' | 'recovery';

export interface PlannerStateDefinition {
  id: PlannerStateId;
  label: string;
  description: string;
  color: string;
  darkColor: string;
  icon: string;
  enforcementLevel: 'absolute' | 'strict' | 'moderate' | 'relaxed';
  descriptionOfEnforcement: string;
}

export const PLANNER_STATES: PlannerStateDefinition[] = [
  {
    id: 'lock-in',
    label: 'Lock-IN',
    description: 'Maximum focus. Minimal distractions. You committed  —  see it through.',
    color: '#dc2626',
    darkColor: '#991b1b',
    icon: '🔒',
    enforcementLevel: 'absolute',
    descriptionOfEnforcement: 'Cannot be cancelled once started. All restrictions are fully enforced.',
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    description: 'Structured productivity. Social & gaming severely limited.',
    color: '#7c3aed',
    darkColor: '#5b21b6',
    icon: '🎯',
    enforcementLevel: 'strict',
    descriptionOfEnforcement: 'Cannot reduce restrictions. Can only extend duration.',
  },
  {
    id: 'balanced',
    label: 'Balanced Day',
    description: 'Reasonable limits. Social & entertainment capped, everything else open.',
    color: '#06b6d4',
    darkColor: '#0891b2',
    icon: '⚖️',
    enforcementLevel: 'moderate',
    descriptionOfEnforcement: 'Can adjust app limits within allowed ranges.',
  },
  {
    id: 'recovery',
    label: 'Recovery',
    description: 'Rest day. Light guardrails for doomscroll only. Recharge intentionally.',
    color: '#10b981',
    darkColor: '#059669',
    icon: '🌿',
    enforcementLevel: 'relaxed',
    descriptionOfEnforcement: 'Minimal enforcement. Doomscroll protection stays active.',
  },
];

export interface CategoryRestriction {
  category: string;
  maxDailyMinutes: number;
  maxSessions: number;
  cooldownBetweenMinutes: number;
  allowed: boolean;
  tooltip: string;
}

export const STATE_CATEGORY_RESTRICTIONS: Record<PlannerStateId, CategoryRestriction[]> = {
  'lock-in': [
    { category: 'doomscroll', maxDailyMinutes: 15, maxSessions: 2, cooldownBetweenMinutes: 60, allowed: true, tooltip: 'Doomscroll-risk apps are hard-limited to 15 min/day in Lock-IN. Only 2 short check-in windows.' },
    { category: 'social', maxDailyMinutes: 15, maxSessions: 2, cooldownBetweenMinutes: 60, allowed: true, tooltip: 'Social apps: 15 min/day, max 2 sessions, 1-hour cooldown between uses.' },
    { category: 'game', maxDailyMinutes: 0, maxSessions: 0, cooldownBetweenMinutes: 0, allowed: false, tooltip: 'Games are completely blocked during Lock-IN.' },
    { category: 'messaging', maxDailyMinutes: 30, maxSessions: 5, cooldownBetweenMinutes: 15, allowed: true, tooltip: 'Messaging apps: 30 min/day for essential communication only.' },
    { category: 'entertainment', maxDailyMinutes: 15, maxSessions: 2, cooldownBetweenMinutes: 60, allowed: true, tooltip: 'Entertainment: 15 min/day, 2 sessions, for brief mental breaks.' },
    { category: 'productive', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Productivity apps are unrestricted during Lock-IN.' },
    { category: 'reading', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Reading apps are unrestricted during Lock-IN.' },
    { category: 'health', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Health apps are unrestricted during Lock-IN.' },
    { category: 'other', maxDailyMinutes: 30, maxSessions: 5, cooldownBetweenMinutes: 30, allowed: true, tooltip: 'Unclassified apps: 30 min/day, 5 sessions max.' },
  ],
  'deep-work': [
    { category: 'doomscroll', maxDailyMinutes: 30, maxSessions: 3, cooldownBetweenMinutes: 45, allowed: true, tooltip: 'Doomscroll-risk apps: 30 min/day, 3 sessions, 45-min cooldown.' },
    { category: 'social', maxDailyMinutes: 30, maxSessions: 3, cooldownBetweenMinutes: 45, allowed: true, tooltip: 'Social apps: 30 min/day, limited check-ins only.' },
    { category: 'game', maxDailyMinutes: 15, maxSessions: 1, cooldownBetweenMinutes: 120, allowed: true, tooltip: 'Games: 1 session of up to 15 min as a break reward.' },
    { category: 'messaging', maxDailyMinutes: 45, maxSessions: 6, cooldownBetweenMinutes: 10, allowed: true, tooltip: 'Messaging: 45 min/day for essential communication.' },
    { category: 'entertainment', maxDailyMinutes: 30, maxSessions: 2, cooldownBetweenMinutes: 45, allowed: true, tooltip: 'Entertainment: 30 min/day, 2 sessions.' },
    { category: 'productive', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Productivity apps: unrestricted.' },
    { category: 'reading', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Reading apps: unrestricted.' },
    { category: 'health', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Health apps: unrestricted.' },
    { category: 'other', maxDailyMinutes: 60, maxSessions: 8, cooldownBetweenMinutes: 15, allowed: true, tooltip: 'Unclassified apps: 60 min/day, 8 sessions.' },
  ],
  'balanced': [
    { category: 'doomscroll', maxDailyMinutes: 60, maxSessions: 5, cooldownBetweenMinutes: 20, allowed: true, tooltip: 'Doomscroll-risk apps: 60 min/day cap, 5 sessions, 20-min cooldowns.' },
    { category: 'social', maxDailyMinutes: 60, maxSessions: 5, cooldownBetweenMinutes: 20, allowed: true, tooltip: 'Social apps: 60 min/day, reasonable check-ins.' },
    { category: 'game', maxDailyMinutes: 60, maxSessions: 3, cooldownBetweenMinutes: 30, allowed: true, tooltip: 'Games: 60 min/day, 3 sessions, 30-min cooldowns.' },
    { category: 'messaging', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Messaging apps: unrestricted. Stay connected.' },
    { category: 'entertainment', maxDailyMinutes: 90, maxSessions: 5, cooldownBetweenMinutes: 15, allowed: true, tooltip: 'Entertainment: 90 min/day, 5 sessions.' },
    { category: 'productive', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Productivity apps: unrestricted.' },
    { category: 'reading', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Reading apps: unrestricted.' },
    { category: 'health', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Health apps: unrestricted.' },
    { category: 'other', maxDailyMinutes: 120, maxSessions: 10, cooldownBetweenMinutes: 5, allowed: true, tooltip: 'Unclassified apps: 120 min/day, 10 sessions.' },
  ],
  'recovery': [
    { category: 'doomscroll', maxDailyMinutes: 90, maxSessions: 8, cooldownBetweenMinutes: 10, allowed: true, tooltip: 'Doomscroll-risk apps: 90 min/day. The only enforced cap  —  protect against hours of mindless scrolling.' },
    { category: 'social', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Social apps: unrestricted. You deserve a break.' },
    { category: 'game', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Games: unrestricted. Enjoy your recovery day.' },
    { category: 'messaging', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Messaging apps: unrestricted.' },
    { category: 'entertainment', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Entertainment: unrestricted.' },
    { category: 'productive', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Productivity apps: unrestricted.' },
    { category: 'reading', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Reading apps: unrestricted.' },
    { category: 'health', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Health apps: unrestricted.' },
    { category: 'other', maxDailyMinutes: 9999, maxSessions: 999, cooldownBetweenMinutes: 0, allowed: true, tooltip: 'Unclassified apps: unrestricted.' },
  ],
};

export interface AppOverride {
  appId: string;
  appName: string;
  category: string;
  customMaxDailyMinutes?: number;
  customMaxSessions?: number;
  customCooldownMinutes?: number;
  customAllowed?: boolean;
  overrideReason?: string;
}

export interface PlannerEntry {
  date: string;
  stateId: PlannerStateId;
  appOverrides: AppOverride[];
  locked: boolean;
}

export interface RecurringPattern {
  id: string;
  stateId: PlannerStateId;
  daysOfWeek: number[];
  startDate: string;
  endDate: string | null;
  appOverrides: AppOverride[];
}

export interface FunctionalBalance {
  overallScore: number;
  focusScore: number;
  recoveryScore: number;
  disciplineScore: number;
  flexibilityScore: number;
  breakdown: BalanceBreakdownItem[];
  adjustmentsNeeded: AdjustmentNote[];
}

export interface BalanceBreakdownItem {
  category: string;
  plannedMinutes: number;
  allowedMinutes: number;
  utilizationPct: number;
  impact: number;
}

export interface AdjustmentNote {
  appId: string;
  appName: string;
  category: string;
  currentStateId: PlannerStateId;
  field: string;
  currentValue: number | boolean;
  suggestedValue: number | boolean;
  reason: string;
  scoreImpact: number;
}

export function getAppCategoryForRestriction(app: {
  category?: string;
  isGame?: boolean;
  isMessaging?: boolean;
  isDoomscrollRisk?: boolean;
}): string {
  if (app.isDoomscrollRisk) return 'doomscroll';
  if (app.isGame || app.category === 'game' || app.category === 'Games') return 'game';
  if (app.isMessaging || app.category === 'messaging') return 'messaging';
  if (app.category === 'social' || app.category === 'Social') return 'social';
  if (app.category === 'productive' || app.category === 'Productivity') return 'productive';
  if (app.category === 'reading') return 'reading';
  if (app.category === 'Health') return 'health';
  if (app.category === 'Entertainment') return 'entertainment';
  return 'other';
}

export function getRestrictionForApp(
  app: { category?: string; isGame?: boolean; isMessaging?: boolean; isDoomscrollRisk?: boolean; },
  stateId: PlannerStateId,
  overrides?: AppOverride[]
): CategoryRestriction & { overridden: boolean } {
  const cat = getAppCategoryForRestriction(app);
  const base = STATE_CATEGORY_RESTRICTIONS[stateId].find(r => r.category === cat) ?? STATE_CATEGORY_RESTRICTIONS[stateId].find(r => r.category === 'other')!;
  const override = overrides?.find(o => o.appId === (app as any).appId || o.appId === (app as any).packageName);
  if (!override) return { ...base, overridden: false };
  return {
    ...base,
    maxDailyMinutes: override.customMaxDailyMinutes ?? base.maxDailyMinutes,
    maxSessions: override.customMaxSessions ?? base.maxSessions,
    cooldownBetweenMinutes: override.customCooldownMinutes ?? base.cooldownBetweenMinutes,
    allowed: override.customAllowed ?? base.allowed,
    overridden: true,
  };
}

export function calculateFunctionalBalance(
  entries: PlannerEntry[],
  classifications: Record<string, any>,
  apps: Array<{ packageName: string; appName: string; timeInForeground: number; category?: string }>
): FunctionalBalance {
  const stateWeights = { 'lock-in': 1.0, 'deep-work': 0.85, 'balanced': 0.6, 'recovery': 0.3 };
  let focusTotal = 0, recoveryTotal = 0, disciplineTotal = 0, flexibilityTotal = 0;
  const breakdown: BalanceBreakdownItem[] = [];
  const adjustmentsNeeded: AdjustmentNote[] = [];
  let entryCount = 0;

  for (const entry of entries) {
    entryCount++;
    const weight = stateWeights[entry.stateId] ?? 0.5;
    focusTotal += weight;

    const isRecovery = entry.stateId === 'recovery';
    recoveryTotal += isRecovery ? 1 : 0.2;
    disciplineTotal += entry.locked ? 1 : 0.4;
    flexibilityTotal += entry.appOverrides.length === 0 ? 1 : Math.max(0.3, 1 - entry.appOverrides.length * 0.1);
  }

  if (entryCount === 0) entryCount = 1;
  const focusScore = Math.min(100, Math.round((focusTotal / entryCount) * 100));
  const recoveryScore = Math.min(100, Math.round((recoveryTotal / entryCount) * 100));
  const disciplineScore = Math.min(100, Math.round((disciplineTotal / entryCount) * 100));
  const flexibilityScore = Math.min(100, Math.round((flexibilityTotal / entryCount) * 100));

  const overallScore = Math.round(focusScore * 0.35 + recoveryScore * 0.2 + disciplineScore * 0.3 + flexibilityScore * 0.15);

  for (const app of apps) {
    const cls = classifications[app.packageName];
    if (!cls) continue;
    for (const entry of entries) {
      const restrictions = STATE_CATEGORY_RESTRICTIONS[entry.stateId];
      const cat = getAppCategoryForRestriction(cls);
      const restriction = restrictions.find(r => r.category === cat) ?? restrictions.find(r => r.category === 'other')!;
      const override = entry.appOverrides.find(o => o.appId === app.packageName);
      if (!restriction.allowed && !override?.customAllowed) continue;

      const plannedMins = (app.timeInForeground || 0) / 60;
      const budgetedMins = override?.customMaxDailyMinutes ?? restriction.maxDailyMinutes;

      if (budgetedMins < 9999 && plannedMins > budgetedMins) {
        adjustmentsNeeded.push({
          appId: app.packageName,
          appName: app.appName || app.packageName,
          category: cat,
          currentStateId: entry.stateId,
          field: 'maxDailyMinutes',
          currentValue: budgetedMins,
          suggestedValue: Math.min(Math.round(plannedMins * 1.1), getMaxForCategoryInState(cat, entry.stateId)),
          reason: `${app.appName || app.packageName} averages ${Math.round(plannedMins)}min/day, exceeding the ${budgetedMins}min ${entry.stateId} budget for ${cat}. Consider adjusting or changing the state.`,
          scoreImpact: -5,
        });
      }
    }
  }

  return { overallScore, focusScore, recoveryScore, disciplineScore, flexibilityScore, breakdown, adjustmentsNeeded };
}

function getMaxForCategoryInState(category: string, stateId: PlannerStateId): number {
  const restriction = STATE_CATEGORY_RESTRICTIONS[stateId].find(r => r.category === category);
  return restriction?.maxDailyMinutes ?? 9999;
}

export function canModifyEntry(entry: PlannerEntry, now: Date = new Date()): boolean {
  if (!entry.locked) return true;
  const entryDate = new Date(entry.date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return entryDate > today;
}

export function canCancelState(stateId: PlannerStateId): boolean {
  return stateId !== 'lock-in';
}